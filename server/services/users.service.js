import { client } from "../index.js";
import { ObjectId } from "mongodb";



export async function addUser(data) {
    return await client.db("URL_Shortner").collection("users").insertOne(data);
}

export async function getUserByUsername(email) {
    return await client.db("URL_Shortner").collection("users").findOne({ email: email });
}

export async function updateactivationById(id) {
    return await client.db("URL_Shortner").collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { activation: true } });
}


export async function updateUser({ email, randomnum }) {
    return await client.db("URL_Shortner").collection("users").updateOne({ email: email }, { $set: { rnm: randomnum } });
}

export async function updateUserByemail({ email, password }) {
    return await client.db("URL_Shortner").collection("users").updateOne({ email: email }, { $set: { password: password } });
}
