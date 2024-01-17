import axios from "axios";
import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../../config";

function Urldirect() {
    const { userid } = useParams();

    const getlongurl = useCallback(async () => {
        try {
            const url = await axios.get(`${config.api}/link/getlongurl/${userid}`, {
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`
                }
            });
            if (url) {
                window.location.href = url.data.longurl;
            } else {
                toast.error(url.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }, [userid]);

    useEffect(() => {
        getlongurl();
    }, [getlongurl]);

    return (
        <>
            <h1>url redirection Please wait {userid}</h1>
        </>
    );
}

export { Urldirect };
