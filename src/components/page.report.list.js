import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Table } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import { removalGetAllReportsService } from "../services/removal.service";

import { FaEdit } from "react-icons/fa";

export default function Reports() {
  /*
   * Private Page Token Verification Module.
   */
  const auth_obj = useSelector((state) => state.auth);
  const { token, expiredAt } = auth_obj;
  const dispatch = useDispatch();
  useEffect(() => {
    setAuthToken(token);
    const verifyTokenTimer = setTimeout(() => {
      dispatch(verifyTokenAsync(true));
    }, moment(expiredAt).diff() - 10 * 1000);
    return () => {
      clearTimeout(verifyTokenTimer);
    };
  }, [expiredAt, token, dispatch]);
  /* ----------------------- */

  const [reports, setReports] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const reportList = await removalGetAllReportsService();

      if (reportList.error) {
        dispatch(userLogoutAsync());
      } else {
        setReports(reportList.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch]);

  const Report = (props) => (
    <tr>
      <td>
        <Link to={"/users/" + props.report.operator._id}>
          {props.report.operator.name}
        </Link>
      </td>
      <td>
        <Link to={"/customers/" + props.report.customerId}>
          {props.report.customer.fName} {props.report.customer.mName}{" "}
          {props.report.customer.lName}
        </Link>
      </td>
      <td className="text-capitalize">{props.report.status}</td>
      <td>{props.report.deleted ? "Yes" : "No"}</td>
      <td>{props.report.archived ? "Yes" : "No"}</td>
      <td>{props.report.hidden ? "Yes" : "No"}</td>
      <td>
        {moment(new Date(props.report.created_at)).format("MMM DD, YYYY")}
      </td>
      <td>
        {moment(new Date(props.report.updated_at)).format("MMM DD, YYYY")}
      </td>
      <td className="text-center">
        <Link to={"/reports/" + props.report._id}>
          <FaEdit size="20" />
        </Link>
      </td>
    </tr>
  );

  const reportList = (reports) => {
    return reports.map(function (report, index) {
      if (report !== null) {
        return <Report report={report} eventKey={index + 1} key={index} />;
      } else {
        return <tr key={index}></tr>;
      }
    });
  };

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Reports",
            btnLink: "",
            btnText: "",
          }}
        />
        <h1 className="m-5 text-center text-navy text-uppercase">
          Report <span className="text-info">List</span>
        </h1>

        <Table striped bordered>
          <thead className="bg-navy text-white">
            <tr>
              <th>Assignee</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Deleted</th>
              <th>Archived</th>
              <th>Hidden</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>{reportList(reports)}</tbody>
        </Table>
      </Container>

      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
