import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

import { verifyTokenAsync } from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import { useFormInput } from "../utils/form-input.util";
import { useFormSelect } from "../utils/form-select.util";
import { userRegisterService } from "../services/user.service";
import Breadcrumb from "../utils/breadcrumb.util";

import { Container, Row, Col, Card, Form } from "react-bootstrap";

export default function UserRegister() {
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

  const name = useFormInput("");
  const email = useFormInput("");
  const phone = useFormInput("");
  const password = useFormInput("");
  const confirm_password = useFormInput("");
  const customersAccess = useFormSelect("assigned");
  const reportAccess = useFormSelect("assigned");
  const supportAccess = useFormSelect("assigned");

  const [showPWError, setShowPWError] = useState(false);
  const [pageError, setPageError] = useState("");

  const updateOperator = async (e) => {
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

    user.access = {
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

    const registeredData = await userRegisterService(user);

    if (registeredData.error) {
      setPageError("Filed to add an Operator. Please try again.");
    } else {
      // history.push("/users");
      window.location.replace("/users");
    }
  };

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

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "Operators",
            parentLink: "/users",
            activePath: "Add New",
            btnLink: "",
            btnText: "",
          }}
        />
        <h1 className="m-5 text-center text-navy text-uppercase">
          <span className="text-info">Add New Agents</span>
        </h1>

        <Form onSubmit={updateOperator}>
          <Row>
            <Col lg={8}>
              <Card className="shadow">
                <Card.Header className="bg-info text-white">
                  <h5 className="m-0 text-center">Operator Details</h5>
                </Card.Header>

                <Card.Body>
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Full Name
                        </Form.Label>

                        <Form.Control
                          required
                          name="op_name"
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
                          name="op_email"
                          type="email"
                          {...email}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Phone Number
                        </Form.Label>
                        <Form.Control name="op_phone" type="phone" {...phone} />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Password
                        </Form.Label>
                        <Form.Control
                          required
                          name="op_password"
                          type="password"
                          {...password}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="font-weight-bold">
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          required
                          name="op_confirm_password"
                          type="password"
                          {...confirm_password}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {showPWError && (
                    <p className="mb-1 text-danger">Invalid Password</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow">
                <Card.Header className="bg-info text-white">
                  <h5 className="m-0 text-center">Manage Access</h5>
                </Card.Header>

                <Card.Body>
                  <Form.Group>
                    <Form.Label className="font-weight-bold">
                      Customers
                    </Form.Label>
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

                  <Form.Group>
                    <Form.Label className="font-weight-bold">Report</Form.Label>

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

                  <Form.Group>
                    <Form.Label className="font-weight-bold">
                      Support
                    </Form.Label>

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
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <button type="submit" className="btn btn-green mt-5 mb-2 mr-3">
            Add Operator
          </button>
        </Form>
      </Container>

      <PageError />
    </>
  );
}
