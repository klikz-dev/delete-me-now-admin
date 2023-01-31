import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Row, Col, Card } from "react-bootstrap";
import BarLoader from "react-spinners/BarLoader";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import {
  activityGetTotal,
  activityGetListService,
} from "../services/activity.service";

import Breadcrumb from "../utils/breadcrumb.util";
import Pagination from "../utils/pagination.util";

export default function ActivityList() {
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

  const [activities, setActivities] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchTotal() {
      const activityTotal = await activityGetTotal();
      if (!activityTotal.error) {
        setTotalPages(parseInt(activityTotal.data.count / 20) + 1);
      }
    }
    async function fetchData() {
      const activityList = await activityGetListService(activePage);
      if (activityList.error) {
        dispatch(userLogoutAsync());
      } else {
        setActivities(activityList.data);
      }
      setPageLoading(false);
    }
    fetchTotal();
    fetchData();
  }, [dispatch, activePage]);

  const Activity = (props) => (
    <Card className="mb-4 shadow">
      <Card.Header className="bg-info">
        <h5 className="text-white text-capitalize mb-0">
          {props.activity?.type} Activity
        </h5>
      </Card.Header>
      <Card.Body className="p-3">
        <p className="mb-1">{props.activity?.name}</p>
        <p className="text-info mb-2">
          <small>{props.activity?.email}</small>
        </p>
        <p className="mb-1">{props.activity?.note}</p>
      </Card.Body>
    </Card>
  );

  const activityList = (props) => {
    if (pageLoading) {
      return (
        <tr>
          <td>
            <Container
              className="py-5 text-center"
              style={{ position: "absolute" }}
            >
              <BarLoader
                css="margin: auto;"
                size={100}
                color={"#007cc3"}
                loading={pageLoading}
              />
            </Container>
          </td>
        </tr>
      );
    } else {
      if (props.activities !== undefined) {
        return props.activities.map(function (activity, index) {
          return <Activity activity={activity} key={index} />;
        });
      }
    }
  };

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

  return (
    <>
      <Container className="p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Activities",
            btnLink: "",
            btnText: "",
          }}
        />

        <h1 className="m-5 text-center">Activities</h1>

        <Row className="mt-4">
          <Col className="px-0">{totalPages > 1 && pagination()}</Col>
        </Row>

        <Row>
          <Col>{activityList(activities)}</Col>
        </Row>
      </Container>
    </>
  );
}
