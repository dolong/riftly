import React, { useEffect, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { BuildCsv } from "./BuildCsv";
import useTable from "@hooks/useTable";
import TableFooter from "../elements/Table/TableFooter";

const fetcher = async (url, req) => await axios.post(url, req).then((res) => res.data);

const USER_STATS_SEARCH = "/challenger/api/admin/user-stats";
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

export default function UserStatsSearchResult({ formData }) {
    const { data, error } = useSWR([USER_STATS_SEARCH, formData], fetcher);

    const [tableData, setTableData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(async () => {
        if (data) {
            try {
                if (formData.contract.length > 0) {
                    let filtered = [];
                    setIsLoading(true);

                    // request a job to run
                    let res = await axios.post(`/challenger/api/admin/user-stats/update`, {
                        contract: formData.contract,
                        chainId: formData.chainId,
                    });

                    if (res.data?.length < 1) {
                        let request;
                        do {
                            request = await axios.get(
                                `/challenger/api/admin/user-stats/getJobState`
                            );
                            console.log(request);
                            await timer(3000);
                        } while (request.data.state !== "completed");
                    }
                    // keep checking database for state change

                    console.log("wait done");

                    res = await axios.get(
                        `/challenger/api/admin/user-stats/getData?contractAddress=${formData.contract}`
                    );

                    console.log("2nd query done");
                    console.log(res.data);
                    filtered = data.filter((d) => {
                        let index = res.data.contractData.findIndex(
                            (e) => e.toLowerCase() == d.wallet.toLowerCase()
                        );
                        if (index !== -1) {
                            return true;
                        } else return false;
                    });

                    setIsLoading(false);
                    return setTableData(filtered);
                }
                setTableData(data);
            } catch (error) {
                setIsLoading(false);
            }
        }
    }, [data]);

    if (error) {
        return <div>{error}</div>;
    }
    if (!tableData || isLoading) return <div>Loading...</div>;

    return (
        <>
            <div className="card-header px-0">
                <h4 className=" mb-0">Result</h4>
                <div className="d-flex ">
                    <a
                        href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                            BuildCsv(tableData)
                        )}`}
                        download={`Search - ${new Date().toISOString()}.csv`}
                        className="mr-2"
                    >
                        Export as CSV
                    </a>

                    <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                            JSON.stringify(tableData)
                        )}`}
                        download={`Search - ${new Date().toISOString()}.json`}
                        className="mr-2"
                    >
                        Export as Json
                    </a>
                    <div className="text-green-600 font-bold">
                        Search Results: {tableData?.length}
                    </div>
                </div>
            </div>
            {tableData?.length > 0 && (
                <Table data={tableData} rowsPerPage={10} setTableData={setTableData} />
            )}
        </>
    );
}

const Table = ({ data, rowsPerPage, setTableData }) => {
    const [page, setPage] = useState(1);
    const { slice, range } = useTable(data, page, rowsPerPage);
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    const handleSortChange = (accessor) => {
        const newOrder = accessor === sortField && sortOrder === "asc" ? "desc" : "asc";
        setSortField(accessor);
        setSortOrder(newOrder);
        handleSorting(accessor, newOrder, data);
    };

    const handleSorting = (sortField, sortOrder) => {
        try {
            if (sortField) {
                console.log("trying to sort");

                const sortedData = [...data].sort((a, b) => {
                    if (
                        a.whiteListUserData === null ||
                        a.whiteListUserData.data[sortField] === null ||
                        !a.whiteListUserData.data[sortField]
                    )
                        return 1;

                    if (
                        b.whiteListUserData === null ||
                        b.whiteListUserData.data[sortField] === null ||
                        !b.whiteListUserData.data[sortField]
                    )
                        return -1;

                    if (
                        (a.whiteListUserData.data[sortField] === null &&
                            b.whiteListUserData.data[sortField] === null) ||
                        (a.whiteListUserData === null && b.whiteListUserData === null)
                    )
                        return 0;

                    return (
                        a.whiteListUserData.data[sortField]
                            .toString()
                            .localeCompare(b.whiteListUserData.data[sortField].toString(), "en", {
                                numeric: true,
                            }) * (sortOrder === "asc" ? 1 : -1)
                    );
                });
                setTableData(sortedData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <div className="table-responsive table-icon">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="col-4">Wallet</th>
                                <th className="col-1">Twitter</th>
                                <th className="col-1">Discord</th>
                                <th
                                    className={`col-1 ${
                                        sortField &&
                                        sortField === "followers_count" &&
                                        sortOrder === "asc"
                                            ? "up"
                                            : sortField &&
                                              sortField === "followers_count" &&
                                              sortOrder === "desc"
                                            ? "down"
                                            : "default"
                                    }`}
                                    key={"followers_count"}
                                    onClick={() => handleSortChange("followers_count")}
                                >
                                    Followers
                                </th>
                                <th
                                    className={`col-1 ${
                                        sortField && sortField === "eth" && sortOrder === "asc"
                                            ? "up"
                                            : sortField &&
                                              sortField === "eth" &&
                                              sortOrder === "desc"
                                            ? "down"
                                            : "default"
                                    }`}
                                    key={"eth"}
                                    onClick={() => handleSortChange("eth")}
                                >
                                    ETH
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {slice.map((el, index) => {
                                return (
                                    <tr key={index}>
                                        <td className="col-3">{el.wallet}</td>
                                        <td className="col-1">{el.twitterUserName}</td>
                                        <td className="col-1">{el.discordUserDiscriminator}</td>
                                        <td className="col-1">
                                            {el.whiteListUserData?.data?.followers_count || 0}
                                        </td>
                                        <td className="col-1">
                                            {el.whiteListUserData?.data?.eth || 0}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <TableFooter range={range} slice={slice} setPage={setPage} page={page} />
                </div>
            </div>
        </div>
    );
};