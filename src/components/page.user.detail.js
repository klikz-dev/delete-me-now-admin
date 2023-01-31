import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Form, Row, Col, Card } from "react-bootstrap";
import Avatar from "react-avatar";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";
import { useFormInput } from "../utils/form-input.util";
import { useFormSelect } from "../utils/form-select.util";

import { verifyTokenAsync } from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import { userGetService, userUpdateService } from "../services/user.service";

import { HiOutlineArrowLeft } from "react-icons/hi";

export default function Users() {
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

  const { id } = useParams();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    access: {},
  });
  const [pageLoading, setPageLoading] = useState(true);

  const [showAccessForm, setShowAccessForm] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [showPWError, setShowPWError] = useState(false);

  const name = useFormInput(user.name);
  const email = useFormInput(user.email);
  const phone = useFormInput(user.phone);
  const password = useFormInput("");
  const confirm_password = useFormInput("");

  const customersAccess = useFormSelect(
    user.access.customers === 2
      ? "all"
      : user.access.customers === 1
      ? "assigned"
      : "none"
  );
  const reportAccess = useFormSelect(
    user.access.report === 2
      ? "all"
      : user.access.report === 1
      ? "assigned"
      : "none"
  );
  const supportAccess = useFormSelect(
    user.access.support === 2
      ? "all"
      : user.access.support === 1
      ? "assigned"
      : "none"
  );

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const userData = await userGetService(id);

      if (!userData.error) {
        setUser(userData.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, id]);

  const updateStatus = async (e, status) => {
    e.preventDefault();

    await userUpdateService(id, { status: status });

    const userData = await userGetService(id);

    if (!userData.error) {
      setUser(userData.data);
    }

    setShowAccessForm(false);
  };

  const updateAccess = async (e) => {
    e.preventDefault();

    const access = {
      customers:
        customersAccess.selected === "all"
          ? 2
          : customersAccess.selected === "assigned"
          ? 1
          : 0,
      report:
        reportAccess.selected === "all"
          ? 2
          : reportAccess.selected === "assigned"
          ? 1
          : 0,
      support:
        supportAccess.selected === "all"
          ? 2
          : supportAccess.selected === "assigned"
          ? 1
          : 0,
    };

    await userUpdateService(id, { access: access });

    const userData = await userGetService(id);

    if (!userData.error) {
      setUser(userData.data);
    }

    setShowAccessForm(false);
  };

  const updateDetail = async (e) => {
    e.preventDefault();

    let user = {};

    if (password.value !== confirm_password.value) {
      setShowPWError(true);
      return;
    } else if (password.value !== "") {
      user = {
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
      };
    } else {
      user = {
        name: name.value,
        email: email.value,
        phone: phone.value,
      };
    }

    await userUpdateService(id, user);

    const userData = await userGetService(id);

    if (!userData.error) {
      setUser(userData.data);
    }

    setShowDetailForm(false);
  };

  const handleShowAccessForm = (e) => {
    e.preventDefault();

    setShowAccessForm(true);
  };

  const handleShowDetailForm = (e) => {
    e.preventDefault();

    setShowPWError(false);
    setShowDetailForm(true);
  };

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "Users",
            parentLink: "/users",
            activePath: "Detail",
            btnLink: "",
            btnText: "",
          }}
        />

        <div className="mb-3">
          <div className="mr-auto">
            <Link to="/users" className="btn btn-outline-info">
              <HiOutlineArrowLeft size="20" className="align-middle" />
            </Link>

            <h4 className="d-inline-block mb-0 ml-3 align-middle">
              {user.name}
            </h4>
          </div>

          <div></div>
        </div>

        <Form autoComplete="off">
          <Row>
            <Col lg="8">
              <Card className="shadow position-relative">
                <div
                  className="d-flex position-absolute p-4"
                  style={{ top: "0", right: "0" }}
                >
                  <button
                    className="btn text-green ml-auto p-0 m-0"
                    onClick={handleShowDetailForm}
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 border-bottom">
                  <div className="d-flex">
                    <Avatar name={user.name} round={true} size={60} />
                    <div className="d-inline-block ml-3 my-2">
                      <h5 className="mb-1">{user.name}</h5>
                      <p className="mb-1">
                        {user.isOwner
                          ? "Owner"
                          : user.role === "admin"
                          ? "System Administrator"
                          : "Service Operator"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <Row>
                    <Col>
                      <p className="text-center text-navy mb-1">
                        Email Address
                      </p>
                      <h5 className="text-center mb-0">{user.email}</h5>
                    </Col>

                    <Col>
                      <p className="text-center text-navy mb-1">Phone Number</p>
                      <h5 className="text-center mb-0">{user.phone}</h5>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="shadow mb-3">
                <div className="p-4 border-bottom">
                  <div className="d-flex mb-4">
                    <h5 className="mb-0">Access</h5>
                    <button
                      className="btn text-green ml-auto p-0 m-0"
                      onClick={handleShowAccessForm}
                    >
                      Manage
                    </button>
                  </div>

                  <div>
                    {user.access.customers === 1 && (
                      <p className="mb-0">Assigned Customers</p>
                    )}
                    {user.access.customers === 2 && (
                      <p className="mb-0">All Customers</p>
                    )}
                    {user.access.report === 1 && (
                      <p className="mb-0">Assigned Reports</p>
                    )}
                    {user.access.report === 2 && (
                      <p className="mb-0">All Reports</p>
                    )}
                    {user.access.support === 1 && (
                      <p className="mb-0">Assigned Tickets</p>
                    )}
                    {user.access.support === 2 && (
                      <p className="mb-0">All Tickets</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="shadow">
                <div className="p-4 border-bottom">
                  <div className="d-flex mb-4">
                    <h5 className="mb-0">Status</h5>
                  </div>

                  <div>
                    <p
                      className={`mb-4 text-capitalize ${
                        user.status === "active"
                          ? "text-info"
                          : user.status === "suspended"
                          ? "text-warning"
                          : "text-danger"
                      } font-weight-bold`}
                    >
                      {user.status === undefined ? "Active" : user.status}
                    </p>
                  </div>

                  {user.status !== "active" && (
                    <div className="mb-2">
                      <button
                        className="btn btn-info"
                        onClick={(e) => updateStatus(e, "active")}
                      >
                        Activate Account
                      </button>
                    </div>
                  )}

                  {user.status !== "suspended" && (
                    <div className="mb-2">
                      <button
                        className="btn btn-warning"
                        onClick={(e) => updateStatus(e, "suspended")}
                      >
                        Suspend Account
                      </button>
                    </div>
                  )}

                  {user.status !== "deleted" && (
                    <div>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => updateStatus(e, "deleted")}
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>

      <PageLoading pageLoading={pageLoading} />

      {showAccessForm && (
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
            <Card
              className="shadow"
              style={{
                maxWidth: "600px",
                width: "600px",
              }}
            >
              <Card.Header className="bg-info text-white">
                <h5 className="m-0 text-center">Manage Access</h5>
              </Card.Header>

              <Card.Body>
                <Form onSubmit={updateAccess}>
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Customers
                        </Form.Label>
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="customersAccess"
                          value="all"
                          label="All"
                          checked={customersAccess.selected === "all"}
                          {...customersAccess}
                        />
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="customersAccess"
                          value="assigned"
                          label="Assigned"
                          checked={customersAccess.selected === "assigned"}
                          {...customersAccess}
                        />
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="customersAccess"
                          value="none"
                          label="No Access"
                          checked={customersAccess.selected === "none"}
                          {...customersAccess}
                        />
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Report
                        </Form.Label>
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="reportAccess"
                          value="all"
                          label="All"
                          checked={reportAccess.selected === "all"}
                          {...reportAccess}
                        />
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="reportAccess"
                          value="assigned"
                          label="Assigned"
                          checked={reportAccess.selected === "assigned"}
                          {...reportAccess}
                        />
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="reportAccess"
                          value="none"
                          label="No Access"
                          checked={reportAccess.selected === "none"}
                          {...reportAccess}
                        />
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Support
                        </Form.Label>
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="supportAccess"
                          value="all"
                          label="All"
                          checked={supportAccess.selected === "all"}
                          {...supportAccess}
                        />
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="supportAccess"
                          value="assigned"
                          label="Assigned"
                          checked={supportAccess.selected === "assigned"}
                          {...supportAccess}
                        />
                        <Form.Check
                          className="mr-5"
                          type="radio"
                          name="supportAccess"
                          value="none"
                          label="No Access"
                          checked={supportAccess.selected === "none"}
                          {...supportAccess}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <button
                    type="submit"
                    className="btn btn-green mt-5 mb-2 mr-3"
                  >
                    Update
                  </button>

                  <button
                    className="btn btn-outline-green mt-5 mb-2"
                    onClick={() => setShowAccessForm(false)}
                  >
                    Cancel
                  </button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {showDetailForm && (
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
            <Card
              className="shadow"
              style={{
                maxWidth: "600px",
                width: "600px",
              }}
            >
              <Card.Header className="bg-info text-white">
                <h5 className="m-0 text-center">Operator Details</h5>
              </Card.Header>

              <Card.Body>
                <Form onSubmit={updateDetail}>
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Full Name
                        </Form.Label>

                        <Form.Control
                          required
                          id="name"
                          name="name"
                          type="text"
                          {...name}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Email Address
                        </Form.Label>
                        <Form.Control
                          required
                          id="email"
                          name="email"
                          type="email"
                          {...email}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          id="phone"
                          name="phone"
                          type="phone"
                          {...phone}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Password
                        </Form.Label>
                        <Form.Control
                          id="password"
                          name="password"
                          type="password"
                          {...password}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          {...confirm_password}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {showPWError && (
                    <p className="mb-1 text-danger">Invalid Password</p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-green mt-5 mb-2 mr-3"
                  >
                    Update
                  </button>

                  <button
                    className="btn btn-outline-green mt-5 mb-2"
                    onClick={() => setShowDetailForm(false)}
                  >
                    Cancel
                  </button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
