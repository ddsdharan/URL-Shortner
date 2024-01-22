import React, { useContext, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { config } from '../../config';
import UserContext from '../../context/UserContext';
import * as yup from "yup";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Form = ({ onSubmit, isSubmitting }) => {
  const { values, touched, errors, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues: {
      "email": localStorage.getItem('email') || "",
      "longurl": ""
    },
    validationSchema: yup.object({
      email: yup.string().required().email(),
      longurl: yup.string().required().min(4)
    }),
    onSubmit,
  });

  return (
    <form onSubmit={handleSubmit} className="forgot-form form">
      <h3>URL SHORTENING</h3>

      <TextField
        type={"text"}
        label="longurl"
        className="form-control form-control-user mb-2"
        name={'longurl'}
        value={values.longurl}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.longurl && errors.longurl ? true : false}
        helperText={touched.longurl && errors.longurl ? errors.longurl : null}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Shortening...' : 'Shorten'}
      </Button>
    </form>
  );
};

const ShortUrlDisplay = ({ shortUrl }) => (
  <div className="forgot-form form">
    {shortUrl.length > 0 ? <>
      <h3>SHORTEN URL</h3>

      <TextField
        type={"text"}
        label="shorturl"
        className="form-control form-control-user mb-2"
        name={'shorturl'}
        value={`${config.client}/${shortUrl}`}
      />

      <CopyToClipboard text={`${config.client}/${shortUrl}`}>
        <Button type="submit" variant="contained">
          Copy
        </Button>
      </CopyToClipboard>
    </> : null}
  </div>
);

const CreateLink = () => {
  const userContextData = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${config.api}/link/createlink`, values, {
        headers: {
          'Authorization': `${localStorage.getItem('token')}`
        }
      });
      const shortLink = response.data.shorturl;
      toast.success(response.data.message);
      userContextData.setshorturl(shortLink);
    } catch (error) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
      userContextData.setshorturl(error.response?.data?.shorturl || '');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      <ShortUrlDisplay shortUrl={userContextData.shorturl} />
    </>
  );
};

export default CreateLink;

