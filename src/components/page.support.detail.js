import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import { Container, Card } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  supportGetUserIdByEmailService,
  supportGetTicketService,
  supportGetCommentsService,
} from "../services/support.service";

import { HiOutlineArrowLeft } from "react-icons/hi";

export default function Support() {
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

  const { username, name } = auth_obj.user;
  const [pageLoading, setPageLoading] = useState(true);

  const [ticketUserId, setTicketUserId] = useState("");
  const [ticket, setTicket] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const ticketUserIdData = await supportGetUserIdByEmailService(
        username,
        name
      );
      if (ticketUserIdData.error) {
        dispatch(userLogoutAsync());
      } else {
        setTicketUserId(ticketUserIdData.data);
      }

      const ticketData = await supportGetTicketService(id);

      if (!ticketData.error) {
        setTicket(ticketData.data);
      }

      const commentsData = await supportGetCommentsService(id);

      if (!commentsData.error) {
        setComments(commentsData.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, username, name, id]);

  const Comment = (props) => (
    <div className="mb-4 border-bottom pb-3 position-relative">
      <h6 className="text-info">
        {props.comment.author_id !== ticketUserId ? "Customer" : "You"}
      </h6>
      <p className="text-navy">{props.comment.body}</p>

      <small
        className={`bg-white text-info p-1 position-absolute mt-1 mr-1`}
        style={{ top: "0", right: "0" }}
      >
        {moment(new Date(props.comment.created_at)).format(
          "MMM DD, YYYY, HH:mm:ss"
        )}
      </small>
    </div>
  );

  const commentList = (comments) => {
    return comments.map(function (comment, index) {
      return <Comment comment={comment} key={index} />;
    });
  };

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "Tickets",
            parentLink: "/supports",
            activePath: "Ticket #" + id,
          }}
        />

        <h1 className="m-5 text-center text-navy text-uppercase">
          Your Ticket <span className="text-info">#{id}</span>
        </h1>

        <Link to="/supports" className="btn btn-outline-info mb-3">
          <HiOutlineArrowLeft size="20" className="align-middle" />
        </Link>

        <Card className="mb-5 border-0">
          <Card.Header className="bg-info border-0 text-white position-relative">
            <h4>{ticket.subject}</h4>
            <small
              className={`text-uppercase ${
                ticket.status === "open"
                  ? "bg-white text-info"
                  : "bg-warning text-white"
              } p-1 position-absolute mt-1 mr-1`}
              style={{ top: "0", right: "0" }}
            >
              {ticket.status}
            </small>
          </Card.Header>
          <Card.Body className="bg-light-blue position-relative">
            {commentList(comments)}
          </Card.Body>
        </Card>
      </Container>

      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
