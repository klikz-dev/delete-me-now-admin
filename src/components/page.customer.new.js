import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { useFormInput } from "../utils/form-input.util";
import { Container, Form, Row, Col } from "react-bootstrap";

import Breadcrumb from "../utils/breadcrumb.util";

import {
  stripeGetCustomerByEmailService,
  stripeAddCustomerService,
  stripeCreateSubscriptionService,
} from "../services/subscriptions.service";

import { customerRegisterService } from "../services/customer.service";

export default function CustomerNew() {
  const history = useHistory();

  const [formError, setFormError] = useState("");

  const fName = useFormInput("");
  const mName = useFormInput("");
  const lName = useFormInput("");
  const email = useFormInput("");
  const phone = useFormInput("");
  const password = useFormInput("");
  const confirmPW = useFormInput("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.value !== confirmPW.value) {
      setFormError("Password doesn't match.");
      return;
    }

    let customerId = "";

    // Create Stripe Customer if not defined
    const customerData = await stripeGetCustomerByEmailService(email.value);
    if (!customerData.error) {
      customerId = customerData.data.id;
    } else {
      const newCustomerData = await stripeAddCustomerService(
        email.value,
        fName.value + " " + mName.value + " " + lName.value
      );
      if (!newCustomerData.error) {
        customerId = newCustomerData.data.id;
      } else {
        setFormError(
          "Invalid Information. Please refresh your page or contact support."
        );
        return;
      }
    }

    // Create Subscription
    if (customerId !== "") {
      const subscriptionData = await stripeCreateSubscriptionService(
        customerId,
        "",
        "price_1J18GpGLa25NHdnwxGkZCfhW",
        "manual"
      );

      if (subscriptionData.error) {
        setFormError(
          "We failed creating your subscription. Please try again or contact customer support center."
        );
        return;
      } else {
        const customerData = await customerRegisterService({
          fName: fName.value,
          mName: mName.value,
          lName: lName.value,
          email: email.value,
          phone: phone.value,
          password: password.value,
          customerId: customerId,
          subscriptionId: subscriptionData.data.id,
          paymentId: "",
        });
        if (customerData.error) {
          setFormError(
            "Internal Server Error. Please try again or contact customer support."
          );
          return;
        } else {
          history.push("/customers");
        }
      }
    }
  };

  return (
    <Container className="position-relative p-5">
      <Breadcrumb
        breadcrumb={{
          parentPath: "Customers",
          parentLink: "/customers",
          activePath: "New Customer",
          btnLink: "",
          btnText: "",
        }}
      />

      <h1 className="m-5 text-center text-navy text-uppercase">
        Add Customer <span className="text-info">Manually</span>
      </h1>

      <div style={{ maxWidth: "600px" }} className="mx-auto card">
        <Form onSubmit={handleSubmit}>
          <Row className="bg-white p-4">
            <Col>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    required
                    id="fName"
                    name="fName"
                    type="text"
                    {...fName}
                  />
                </Form.Group>

                <Form.Group as={Col}>
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control
                    id="mName"
                    name="mName"
                    type="text"
                    {...mName}
                  />
                </Form.Group>

                <Form.Group as={Col}>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    id="lName"
                    name="lName"
                    type="text"
                    {...lName}
                  />
                </Form.Group>
              </Form.Row>

              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  id="email"
                  name="email"
                  type="email"
                  {...email}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  required
                  id="phone"
                  name="phone"
                  type="phone"
                  {...phone}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  id="password"
                  name="password"
                  type="password"
                  {...password}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  required
                  id="confirmPW"
                  name="confirmPW"
                  type="password"
                  {...confirmPW}
                />
              </Form.Group>

              {formError && <p className="text-danger">{formError}</p>}

              <button className="btn btn-green" type="submit">
                Submit
              </button>
            </Col>
          </Row>
        </Form>
      </div>
    </Container>
  );
}
