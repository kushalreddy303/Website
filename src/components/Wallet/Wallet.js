import { React, useState, useEffect, useContext } from "react";
import "./Wallet.css";
import TransactionTable from "./TransactionGrid";
import WithdrawGrid from "./WithdrawGrid";

import axios from "../../axios";
import { Helmet } from "react-helmet";
import { UserContext } from "../../Context/userContext";
import { useHistory } from "react-router-dom";

// Wallet Components
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LoadingButton from "@mui/lab/LoadingButton";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@material-ui/lab/Alert";

// icons
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import SendIcon from "@material-ui/icons/Send";
import CreditIcon from "@material-ui/icons/CallMadeRounded";
import DebitIcon from "@material-ui/icons/CallReceivedRounded";

const stackStyle = {
  padding: "12px 15px",
};

const iconStyle = {
  fontSize: "0.75rem",
};
const Wallet = () => {
  const history = useHistory();
  const [user, setUser] = useContext(UserContext);

  const [loaded, setLoaded] = useState(false);
  const [walletBalance, setwalletBalance] = useState(0);
  const [withdrawRequest, setwithdrawRequest] = useState([]);
  const [transactionList, settransactionList] = useState([]);
  const [requesting, setrequesting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    severity: "success",
    msg: "",
  });

  const [widthdrawAmount, setwithdrawAmount] = useState(10);
  const [accountDetails, setaccountDetails] = useState("");
  const [debitAmount, setdebitAmount] = useState(0);
  const [creditAmount, setcreditAmount] = useState(0);

  // handel Debit Amount
  const handelDebitAmount = (debitList) => {
    let amount = 0;
    for (let i = 0; i < debitList.length; i++) {
      if (debitList[i].type === "DEBIT") {
        amount += debitList[i].amount;
      }
      if (i === debitList.length - 1) {
        setdebitAmount(amount);
      }
    }
  };

  // handel Debit Amount
  const handelCreditAmount = (creditList) => {
    let amount = 0;
    for (let i = 0; i < creditList.length; i++) {
      if (creditList[i].type === "CREDIT") {
        amount += creditList[i].amount;
      }
      if (i === creditList.length - 1) {
        setcreditAmount(amount);
      }
    }
  };

  // handeling Withdraw Request
  const handelWithdrawRequest = () => {
    setrequesting(true);
    const makeRequest = async () => {
      axios
        .post("/withdrawFromWallet", {
          amount: Number(widthdrawAmount),
          bankAccountDetails: accountDetails,
        })
        .then((response) => {
          // console.log(response.data);
          setrequesting(false);
          setAlert({
            show: true,
            msg: response.data.msg,
            severity: "success",
          });
          history.go(0);
          setTimeout(() => {
            setAlert({
              show: false,
              msg: "",
              severity: "success",
            });
            setwithdrawAmount(10);
            setaccountDetails("");
          }, 5000);
        })
        .catch((error) => {
          // console.log(error.response.data);
          setAlert({
            show: true,
            msg: error.response.data.msg,
            severity: "error",
          });
        });
    };
    makeRequest();
  };

  useEffect(() => {
    const fetchdata = async () => {
      axios
        .get("/getCurrentBalance")
        .then((response) => {
          setwalletBalance(response.data.walletBalance);
          axios
            .get("/getTransactionList")
            .then((response) => {
              // console.log(response.data);
              handelDebitAmount(response.data);
              handelCreditAmount(response.data);
              settransactionList(response.data);
              axios
                .get("/getWithdrawRequests")
                .then((response) => {
                  // console.log(response.data);
                  setwithdrawRequest(response.data);
                  setTimeout(() => {
                    setLoaded(true);
                  }, 1000);
                })
                .catch((error) => {});
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    };
    fetchdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Wallet | Bookshlf</title>
        <meta name="description" content="Seller Wallet Bookshlf" />
      </Helmet>
      <Grid container spacing={2} style={{ padding: "10px" }}>
        <Grid item xs={12} lg={6} md={12} sm={12}>
          <Stack direction="column" spacing={2}>
            {!loaded ? (
              <>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={50}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={50}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={50}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>
              </>
            ) : (
              <Paper elevation={2}>
                <Stack direction="column" spacing={3} style={stackStyle}>
                  <Stack direction="row" justifyContent="space-between">
                    <div className="wallet-stack-item">
                      <h3>Balance</h3>
                    </div>
                    <div className="wallet-stack-item">
                      <h3 className="rupee-custom-style">
                        <i className="fas fa-rupee-sign" />
                      </h3>
                    </div>
                  </Stack>
                  <Stack direction="row" spacing={3}>
                    <div className="wallet-stack-item">
                      <h2>
                        <i className="fas fa-rupee-sign" />
                      </h2>
                    </div>
                    <div className="wallet-stack-item">
                      <h4 className="amount-icon">{walletBalance}</h4>
                    </div>
                  </Stack>
                  <Stack direction="row" spacing={5} justifyContent="center">
                    <div className="wallet-stack-item">
                      <span className="amount-icon">
                        <DebitIcon style={iconStyle} />
                      </span>
                      <span className="debit-amount">
                        - <i className="fas fa-rupee-sign" /> {debitAmount}
                      </span>
                    </div>
                    <div className="wallet-stack-item">
                      <span className="amount-icon">
                        <CreditIcon style={iconStyle} />
                      </span>
                      <span className="credit-amount">
                        + <i className="fas fa-rupee-sign" /> {creditAmount}
                      </span>
                    </div>
                  </Stack>
                </Stack>
              </Paper>
            )}
            {!loaded ? (
              <>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={100}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>

                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={100}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>
              </>
            ) : (
              <Paper elevation={2}>
                <Stack direction="column" spacing={2} style={stackStyle}>
                  <TextField
                    label="Amount"
                    helperText="Enter Amount To be Withdrawn. Min Amount is 10."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="fas fa-rupee-sign" />
                        </InputAdornment>
                      ),
                    }}
                    variant="standard"
                    value={widthdrawAmount}
                    onChange={(e) => {
                      setwithdrawAmount(e.target.value);
                    }}
                  />
                  <TextField
                    label="Account Details"
                    helperText="Please Provide Bank Account Details (Account Number & branch ISBN Code ) or UPI ID or Phone Number "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon />
                        </InputAdornment>
                      ),
                    }}
                    variant="standard"
                    value={accountDetails}
                    onChange={(e) => {
                      setaccountDetails(e.target.value);
                    }}
                  />
                  <LoadingButton
                    onClick={handelWithdrawRequest}
                    endIcon={<SendIcon />}
                    loading={requesting}
                    loadingPosition="end"
                    variant="contained"
                    style={{
                      fontFamily: "PT sans",
                      fontSize: "12px",
                      letterSpacing: "1px",
                    }}
                  >
                    Withdraw
                  </LoadingButton>
                  {alert.show ? (
                    <Alert severity={alert.severity}>{alert.msg}</Alert>
                  ) : null}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6} md={12} sm={12}>
          <Stack direction="column" spacing={2}>
            {!loaded ? (
              <>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>
              </>
            ) : (
              <Stack
                direction="column"
                spacing={1}
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: "10px",
                }}
              >
                <b className="amount-icon"> Recent Widthdraw Requests </b>
                <WithdrawGrid data={withdrawRequest} />
              </Stack>
            )}
            {!loaded ? (
              <>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150}
                  sx={{ bgcolor: "grey.500" }}
                ></Skeleton>
              </>
            ) : (
              <Stack
                direction="column"
                spacing={1}
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: "10px",
                }}
              >
                <b className="amount-icon"> Previous Transactions </b>
                <TransactionTable data={transactionList} />
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default Wallet;
