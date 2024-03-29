import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { config } from "../../config";
import ListTable from "./ListTable";

function ListUrl() {
    let mail = localStorage.getItem('email');
    const initialRows = [];

    const [rows, setRows] = useState(initialRows);

    const columns = [
        "longurl",
        "shorturl",
        "clicked count"
    ];
    const getList = useCallback(async () => {
        try {
            const url = await axios.get(`${config.api}/link/geturls/${mail}`, {
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`
                }
            });

            if (url) {
                const formattedArray = url.data.newData.map((obj) => {
                    return {
                        longurl: obj.longurl,
                        clickedcount: obj.clickedcount,
                        shorturl: obj.shorturl
                    };
                });

                setRows(formattedArray);
            } else {
                toast.error(url.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }, [mail]);

    useEffect(() => {
        getList();
    }, []);

    return (
        <>
            <div className="list-url-container">
                list url page
                <ListTable rows={rows} columns={columns} />
            </div>
        </>
    );
}

export { ListUrl };
