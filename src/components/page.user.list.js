import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Container, Table, Card, Tabs, Tab } from "react-bootstrap";
import moment from "moment";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import { userGetListService } from "../services/user.service";
import { verifyTokenAsync } from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

export default function UserList() {
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

  const [users, setUsers] = useState([]);
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [tabKey, setTabKey] = useState("active");

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const result = await userGetListService();
      if (!result.error) {
        setUsers(result.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch]);

  const PageError = () => {
    return (
      <>
        {pageError && (
          <div
            className="position-fixed w-100 h-100 custom--desktop-padding-left-270"
            style={{ zIndex: "1000", top: "0", left: "0", minHeight: "100vh" }}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center w-100 h-100 px-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, .8)",
              }}
            >
              <Card className="shadow" style={{ maxWidth: "500px" }}>
                <Card.Header
                  style={{ backgroundColor: "rgba(3, 169, 244, 0.6)" }}
                >
                  <h5 className="m-0 text-center">Error</h5>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">{pageError}</p>

                  <button
                    className="btn btn-outline-green"
                    onClick={() => setPageError("")}
                  >
                    Close
                  </button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  };

  const handleTabSwitch = (k) => {
    setTabKey(k);
  };

  const User = (props) => (
    <tr>
      <td>
        <Link to={"/users/" + props.user._id}>
          {props.user.name} {props.isYou && "(You)"}
        </Link>
      </td>
      <td>{props.user.email}</td>
      <td>{props.user.phone}</td>
      {props.user.isOwner && <td>Full Access</td>}
      {!props.user.isOwner && (
        <td>
          {props.user.access.customers === 1 && (
            <>
              <span>Assigned Customers</span>
              <br />
            </>
          )}
          {props.user.access.customers === 2 && (
            <>
              <span>All Customers</span>
              <br />
            </>
          )}
          {props.user.access.report === 1 && (
            <>
              <span>Assigned Reports</span>
              <br />
            </>
          )}
          {props.user.access.report === 2 && (
            <>
              <span>All Reports</span>
              <br />
            </>
          )}
          {props.user.access.support === 1 && (
            <>
              <span>Assigned Tickets</span>
              <br />
            </>
          )}
          {props.user.access.support === 2 && (
            <>
              <span>All Tickets</span>
              <br />
            </>
          )}
        </td>
      )}

      <td className="text-capitalize">
        {props.user.status === undefined ? "Active" : props.user.status}
      </td>
    </tr>
  );

  const activeUserList = (users) => {
    return users.map(function (user, index) {
      if (user.status !== "active") {
        return <tr key={index}></tr>;
      } else {
        return <User user={user} key={index} />;
      }
    });
  };

  const inactiveUserList = (users) => {
    return users.map(function (user, index) {
      if (user.status !== "active") {
        return <User user={user} key={index} />;
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
            activePath: "Operators",
            btnLink: "/users/add",
            btnText: "Add New Agent",
          }}
        />

        <h1 className="m-5 text-center text-navy text-uppercase">
          <span className="text-info">Privacy Agents</span>
        </h1>

        <Tabs
          id="controlled-tab-example"
          activeKey={tabKey}
          onSelect={(k) => handleTabSwitch(k)}
        >
          <Tab eventKey="active" title="Active Agents" className="py-4 px-3">
            <Table striped bordered>
              <thead className="bg-navy text-white">
                <tr>
                  <th style={{ width: "200px" }}>Full Name</th>
                  <th style={{ width: "200px" }}>Email</th>
                  <th style={{ width: "180px" }}>Phone</th>
                  <th>Access</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>{activeUserList(users)}</tbody>
            </Table>
          </Tab>

          <Tab
            eventKey="inactive"
            title="Inactive Agents"
            className="py-4 px-3"
          >
            <Table striped bordered>
              <thead className="bg-navy text-white">
                <tr>
                  <th style={{ width: "200px" }}>Full Name</th>
                  <th style={{ width: "200px" }}>Email</th>
                  <th style={{ width: "180px" }}>Phone</th>
                  <th>Access</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>{inactiveUserList(users)}</tbody>
            </Table>
          </Tab>
        </Tabs>
      </Container>

      <PageError />
      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
