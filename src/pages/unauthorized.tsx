import React from "react";
import Head from "next/head";

const IndexPage = () => {
  return (
    <div className="index">
      <Head>
        <title>Dragon Guild</title>
      </Head>
      <h1>Dragon Guild</h1>
      <div className="message">
        Sorry, there's a dress code. (Dragonskin wearers only)
      </div>
      <style jsx>{`
        .index {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        h1 {
          font-size: 32px;
          margin: 0;
          padding: 0;
          font-weight: normal;
        }
        .message {
          margin-top: 20px;
          opacity: 0.5;
        }
        button {
          margin-top: 20px;
          background-color: transparent;
          border: none;
          outline: none;
          color: white;
          font-family: serif;
          padding: 0;
          font-size: 18px;
          cursor: pointer;
          background-color: hsl(203, 18%, 19%);
          padding: 10px 20px;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
};

export default IndexPage;
