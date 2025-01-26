import React from "react";
import { useParams } from "react-router-dom";

const Stylist = () => {
  const { stylistId } = useParams();
  return <h1>Stylist: {stylistId}</h1>;
};

export default Stylist;
