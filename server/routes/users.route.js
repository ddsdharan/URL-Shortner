import express from "express";
import bcrypt from "bcrypt";
import { addUser, getUserByUsername, updateactivationById, updateUser, updateUserByemail } from "../services/users.service.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import rn from "random-number";
const clienturl = process.env.clienturl;

const options = {
    min: 1000,
    max: 9999,
    integer: true
}

const router = express.Router();

async function generateHashedPassword(password) {
    const NO_OF_ROUNDS = 10;
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}
router.post("/register", async function (request, response) {
    try {
        const { firstname, lastname, email, password } = request.body;

        // Check if the user already exists
        const userFromDB = await getUserByUsername(email);
        if (userFromDB) {
            return response.status(400).send({ message: "Username already exists. Please choose another username." });
        }

        // Validate password existence and length
        if (!password || password.length < 8) {
            return response.status(400).send({ message: "Password must be at least 8 characters long." });
        }

        // Hash the password
        const hashedPassword = await generateHashedPassword(password);

        // Add user to the database with activation set to false
        const result = await addUser({ firstname, lastname, email, password: hashedPassword, activation: false });

        // Fetch the user from the database
        const user = await getUserByUsername(email);

        // Create a nodemailer transporter
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }
        });

        // Define email options
        var mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Activate Your Account",
            text: "Hi",
            html: `<h1>Hello ${user.firstname},</h1><p>Please click the link to activate your account: <a href="${clienturl}/user/activation/${user._id}">Activate Account</a></p>`,
        };

        // Send the activation email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return response.json({ message: "Error sending activation email." });
            } else {
                console.log('Email sent: ' + info.response);
                return response.json({ message: "Registration successful. Check your email for activation." });
            }
        });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal Server Error" });
    }
});

//account activation
// router.put("/activation/:id", async (request, response) => {
//     try {
//         const { id } = request.params;
//         const user = await updateactivationById(id);
//         response.json({ message: "Your account activated" });
//     } catch (error) {
//         response.status(400).json({ message: "Something went wrong" });
//     }
// });

router.put("/activation/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const user = await updateactivationById(id);

        if (user) {
            response.json({ message: "Your account activated" });
        } else {
            response.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: "Internal Server Error", error: error.message, stack: error.stack });
    }
});


// router.put("/activation/:id", async (request, response) => {
//     try {
//         const { id } = request.params;
//         const user = await updateactivationById(id);

//         if (user) {
//             response.json({ message: "Your account activated" });
//         } else {
//             response.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         console.error(error);
//         response.status(500).json({ message: "Internal Server Error" });
//     }
// });

router.post("/login", async function (request, response) {
    const { email, password } = request.body;
    const userFromDB = await getUserByUsername(email);
    // console.log(userFromDB);
    if (!userFromDB) {
        response.status(401).send({ message: "invalid credentials try again" })
    } else {
        if (!userFromDB.activation) {
            response.status(401).send({ message: "Activate your account" })
        } else {
            const storedDBPassword = userFromDB.password;
            const isPasswordCheck = await bcrypt.compare(password, storedDBPassword);

            if (isPasswordCheck) {
                const token = jwt.sign({ id: userFromDB._id }, process.env.SECRET_KEY);
                response.send({ message: "Successful Login", token: token, email: userFromDB.email });
            } else {
                response.status(401).send({ message: "invalid credentials try again" })
            }
        }
    }

})
router.post('/sendmail', async function (request, response) {
    try {
        const email = request.body.email;
        const user = await getUserByUsername(email);
        if (user) {
            let randomnum = rn(options);
            console.log("body", request.body.email);
            await updateUser({ email: request.body.email, randomnum: randomnum });
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                host: "smtp.gmail.com",
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                }
            });

            var mailOptions = {
                from: process.env.EMAIL,
                to: `${request.body.email}`,
                subject: 'User verification',
                text: `${randomnum}`,
                //html: `<h2>Password : ${req.body.Password}</h2>`
            };

            await transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    response.json({
                        message: "Error"
                    })
                } else {
                    console.log('Email sent: ' + info.response);
                    response.json({
                        message: "Email sent"
                    })
                }
            });
        }
        else {
            response.status(400).json({ message: 'User not found' })
        }
    }
    catch (error) {
        console.log(error);
    }
})
// verify 

router.post("/verify", async (request, response) => {
    try {
        const { email, vercode } = request.body;
        const user = await getUserByUsername(email);

        if (user.rnm === vercode) {
            response.status(200).json(user)
        }
        else {
            response.status(400).json({ message: "Invalid Verification Code" })
        }
    } catch (error) {
        console.log(error);
    }
})
// update password
router.post('/changepassword/:email', async function (request, response) {
    try {
        let { password } = request.body;
        const { email } = request.params;
        const hashedPassword = await generateHashedPassword(password);
        password = hashedPassword;
        const result = await updateUserByemail({ email, password });
        if (result) {
            response.json({ message: "Reset the password successfully" });
        } else {
            response.json({ message: "Something went wrong" });
        }
    } catch (error) {
        console.log(error);
    }
})
export default router;
