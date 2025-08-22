import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Pagination from "react-bootstrap/Pagination";

export default function MockTester() {
  const [state, setState] = useState({
    data: [],
    limit: 10,
    activePage: 1
  });

  useEffect(() => {
    axios
      .get(
        `https://jsonplaceholder.typicode.com/posts?_page=1&_limit=${state.limit}`
      )
      .then((res) => {
        setState((prev) => ({
          ...prev,
          data: res.data
        }));
      })
      .catch((error) => console.log(error));
  }, [state.limit]);
  const handlePageChange = (pageNumber) => {
    setState((prev) => ({ ...prev, activePage: pageNumber }));

    axios
      .get(`https://jsonplaceholder.typicode.com/posts?_page=${pageNumber}`)
      .then((res) => {
        setState((prev) => ({
          ...prev,
          data: res.data
        }));
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="App">
      <h2 className="mt-5 px-4">React Bootstrap pagination example</h2>

      <ul className="list-group p-4">
        {state.data.map((item) => {
          return (
            <li key={item.id} className="list-group-item">
              <span className="font-weight-bold pr-2">{item.id}.</span>{" "}
              {item.title}
            </li>
          );
        })}
      </ul>

      <Pagination className="px-4">
        {state.data.map((_, index) => {
          return (
            <Pagination.Item
              onClick={() => handlePageChange(index + 1)}
              key={index + 1}
              active={index + 1 === state.activePage}
            >
              {index + 1}
            </Pagination.Item>
          );
        })}
      </Pagination>
    </div>
  );
}
