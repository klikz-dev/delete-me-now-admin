import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Table } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";
import Pagination from "../utils/pagination.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import {
  customerGetTotalService,
  customerGetListService,
} from "../services/customer.service";

import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";

export default function Customers() {
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

  const [customers, setCustomers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [sortBy, setSortBy] = useState("customer");
  const [sortDirection, setSortDirection] = useState(0);

  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const customerTotal = await customerGetTotalService();
      if (!customerTotal.error) {
        setTotalPages(parseInt(customerTotal.data.count / 10) + 1);
      }

      const customerList = await customerGetListService(activePage);

      if (customerList.error) {
        dispatch(userLogoutAsync());
      } else {
        setCustomers(customerList.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, activePage]);

  const Customer = (props) => (
    <tr>
      <td>
        <Link to={"/customers/" + props.customer._id}>
          {props.customer.fName} {props.customer.mName} {props.customer.lName}
        </Link>
      </td>
      <td>
        {props.customer.assignee !== undefined && (
          <Link to={"/users/" + props.customer.assignee._id}>
            {props.customer.assignee.name}
          </Link>
        )}
      </td>
      <td>{props.customer.email}</td>
      <td className="text-capitalize">
        {props.customer.subscription?.status === "active" ||
        props.customer.subscription?.status === "trialing" ? (
          <span className="text-info font-weight-bold">Active</span>
        ) : props.customer.role === "master" ? (
          <span className="text-danger font-weight-bold">Cancelled</span>
        ) : (
          <>
            <small className="font-weight-bold">Member Account</small>
            <br />
            <a href={`/customers/${props.customer.masterId}`}>
              <small>View Main Account</small>
            </a>
          </>
        )}
      </td>
      <td>
        {(props.customer.subscription?.status === "active" ||
          props.customer.subscription?.status === "trialing") &&
          moment(
            new Date(props.customer.subscription?.current_period_end * 1000)
          ).format("MMM DD, YYYY")}
      </td>
      <td>
        {(props.customer.subscription?.status === "active" ||
          props.customer.subscription?.status === "trialing") &&
        props.customer.subscription?.plan?.id ===
          "price_1J0kDUGLa25NHdnwddahBdhv"
          ? "Solo (Monthly)"
          : (props.customer.subscription?.status === "active" ||
              props.customer.subscription?.status === "trialing") &&
            (props.customer.subscription?.plan?.id ===
              "price_1J0kDUGLa25NHdnwHDHLUyG0" ||
              props.customer.subscription?.plan?.id ===
                "price_1J18GpGLa25NHdnwxGkZCfhW")
          ? "Solo (Yearly)"
          : (props.customer.subscription?.status === "active" ||
              props.customer.subscription?.status === "trialing") &&
            props.customer.subscription?.plan?.id ===
              "price_1J0kDPGLa25NHdnwtXwI9qzP"
          ? "Double (Monthly)"
          : (props.customer.subscription?.status === "active" ||
              props.customer.subscription?.status === "trialing") &&
            props.customer.subscription?.plan?.id ===
              "price_1J0kDPGLa25NHdnwHBHBbmpD"
          ? "Double (Yearly)"
          : (props.customer.subscription?.status === "active" ||
              props.customer.subscription?.status === "trialing") &&
            props.customer.subscription?.plan?.id ===
              "price_1J0kDJGLa25NHdnwwku4MWoQ"
          ? "Family (Monthly)"
          : (props.customer.subscription?.status === "active" ||
              props.customer.subscription?.status === "trialing") &&
            props.customer.subscription?.plan?.id ===
              "price_1J0kDJGLa25NHdnw5WW4Ij1t"
          ? "Family (Yearly)"
          : ""}
      </td>
      <td>
        {(props.customer.subscription?.status === "active" ||
          props.customer.subscription?.status === "trialing") &&
          "$" + (props.customer.subscription?.plan?.amount / 100).toFixed(2)}
      </td>
      <td>
        {moment(new Date(props.customer.updated_at)).format(
          "MMM DD, YYYY hh:mm"
        )}
      </td>
    </tr>
  );

  const pagination = () => {
    async function handleNextPage(activePage) {
      setActivePage(activePage);
    }

    return (
      <Pagination
        totalPages={totalPages}
        currentPage={activePage}
        onChange={handleNextPage}
      />
    );
  };

  const customerList = (customers, sortBy, sortDirection) => {
    if (sortBy === "customer") {
      customers.sort((a, b) => {
        if (sortDirection) {
          if (a.fName.toUpperCase() > b.fName.toUpperCase()) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (a.fName.toUpperCase() > b.fName.toUpperCase()) {
            return -1;
          } else {
            return 1;
          }
        }
      });
    }

    if (sortBy === "assignee") {
      customers.sort((a, b) => {
        if (sortDirection) {
          if (
            a.assignee?.name?.toUpperCase() > b.assignee?.name?.toUpperCase()
          ) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (
            a.assignee?.name?.toUpperCase() > b.assignee?.name?.toUpperCase()
          ) {
            return -1;
          } else {
            return 1;
          }
        }
      });
    }

    if (sortBy === "subscription") {
      customers.sort((a, b) => {
        if (sortDirection) {
          if (
            a.subscription?.status?.toUpperCase() <
              b.subscription?.status?.toUpperCase() ||
            b.subscription?.status?.toUpperCase() === "" ||
            b.subscription?.status?.toUpperCase() === undefined
          ) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (
            a.subscription?.status?.toUpperCase() <
              b.subscription?.status?.toUpperCase() ||
            b.subscription?.status?.toUpperCase() === "" ||
            b.subscription?.status?.toUpperCase() === undefined
          ) {
            return -1;
          } else {
            return 1;
          }
        }
      });
    }

    return customers.map(function (customer, index) {
      return <Customer customer={customer} eventKey={index + 1} key={index} />;
    });
  };

  const handleSort = (sortBy, sortDirection) => {
    setSortBy(sortBy);
    setSortDirection(sortDirection);
  };

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Customers",
            btnLink: "/customers/new",
            btnText: "Add Customer",
          }}
        />
        <h1 className="m-5 text-center text-navy text-uppercase">
          Customer <span className="text-info">List</span>
        </h1>

        {totalPages > 1 && pagination()}

        <Table striped bordered>
          <thead className="bg-navy text-white">
            <tr>
              <th style={{ width: "150px" }}>
                <span
                  className="d-flex"
                  onClick={() => handleSort("customer", !sortDirection)}
                >
                  Customer
                  {sortBy === "customer" &&
                    (sortDirection ? (
                      <AiFillCaretDown className="m-1" />
                    ) : (
                      <AiFillCaretUp className="m-1" />
                    ))}
                </span>
              </th>
              <th style={{ width: "100px" }}>
                <span
                  className="d-flex"
                  onClick={() => handleSort("assignee", !sortDirection)}
                >
                  Assignee
                  {sortBy === "assignee" &&
                    (sortDirection ? (
                      <AiFillCaretDown className="m-1" />
                    ) : (
                      <AiFillCaretUp className="m-1" />
                    ))}
                </span>
              </th>
              <th style={{ width: "120px" }}>Email Address</th>
              <th style={{ width: "250px" }}>
                <span
                  className="d-flex"
                  onClick={() => handleSort("subscription", !sortDirection)}
                >
                  Status
                  {sortBy === "subscription" &&
                    (sortDirection ? (
                      <AiFillCaretDown className="m-1" />
                    ) : (
                      <AiFillCaretUp className="m-1" />
                    ))}
                </span>
              </th>
              <th style={{ width: "150px" }}>Renews</th>
              <th style={{ width: "150px" }}>Plan</th>
              <th style={{ width: "150px" }}>Subscription</th>
              <th style={{ width: "150px" }}>Last Updated</th>
            </tr>
          </thead>

          <tbody>{customerList(customers, sortBy, sortDirection)}</tbody>
        </Table>
      </Container>

      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
