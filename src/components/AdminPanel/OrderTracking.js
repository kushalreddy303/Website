import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import axios from "../../axios";

// components
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@material-ui/core/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import TextField from "@mui/material/TextField";

// icons
import NextIcon from "@material-ui/icons/NavigateNextRounded";
import CheckIcon from "@material-ui/icons/CheckCircleRounded";
import CallIcon from "@material-ui/icons/CallRounded";

const useStyles = makeStyles({
  root: {
    fontFamily: "PT sans !important",
    "& span": {
      fontFamily: "PT sans !important",
    },
    "& p": {
      fontFamily: "PT sans !important",
    },
    "& input": {
      fontFamily: "PT sans !important",
    },
    "& label": {
      fontFamily: "PT sans !important",
    },
  },
});

const getSteps = () => {
  return ["Order Placed", "Order Shipped", "Order En Route", "Order Delivered"];
};

const getStepContent = (stepIndex) => {
  switch (stepIndex) {
    case 0:
      return "Your Order Has Been Received and is Currently Being Processed";
    case 1:
      return "Your Order Has been Packed and Ready for Shipment";
    case 2:
      return "Your Order Has Been Shipped and Order is Currently on the Way";
    case 3:
      return "Your Order Has Been Delivered";
    default:
      return "Unknown stepIndex";
  }
};

const OrderTracking = () => {
  const classes = useStyles();
  const params = useParams();
  const [order, setorder] = useState({});
  const [load, setload] = useState(false);
  const [cls, setcls] = useState({
    Cls: "fas fa-window-close",
    msg: "Cancel Order",
  });

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const [next, setnext] = useState(false);
  const [back, setback] = useState(false);
  const [paid, setpaid] = useState(false);
  const [trackLink, settrackLink] = useState("");

  useEffect(() => {
    const fetchdata = async () => {
      axios
        .get("/admin-getOrderDetails", {
          params: { orderId: params.orderId },
        })
        .then((response) => {
          setorder(response.data);
          setpaid(response.data.isSellerPaid);
          settrackLink(response.data?.externalTrackingLink);
          console.log(response.data);
          setActiveStep(Math.round(response.data.progress / 25));
          setload(true);
        })
        .catch((error) => {});
    };
    fetchdata();
  }, []);

  const handelCancelOrder = (ORDERID) => {
    setcls({
      Cls: "fas fa-spinner",
      msg: "Cancelling Order...",
    });
    axios
      .delete("/admin-markOrderAsCancelled", {
        data: { orderId: ORDERID },
      })
      .then((response) => {
        setcls({
          Cls: "fas fa-check-circle",
          msg: "Order Cancelled",
        });
      });
  };

  const handleNextStep = (OrderId) => {
    setnext(true);
    if (activeStep === 0) {
      axios
        .post("/admin-markOrderAsPacked", { orderId: OrderId })
        .then((response) => {
          axios
            .post("/admin-changeOrderProgress", {
              orderId: OrderId,
              progress: 25,
            })
            .then(() => {
              setActiveStep(1);
              setnext(false);
            })
            .catch(() => {
              setnext(false);
            });
        })
        .catch((error) => {
          // console.log(error.response.data);
          if (error.response.data.error === "Order already marked as packed") {
            setActiveStep(1);
            setnext(false);
          }
        });
    } else if (activeStep === 1) {
      axios
        .post("/admin-markOrderAsShipped", { orderId: OrderId })
        .then((response) => {
          axios
            .post("/admin-changeOrderProgress", {
              orderId: OrderId,
              progress: 50,
            })
            .then(() => {
              setActiveStep(2);
              setnext(false);
            })
            .catch(() => {
              setnext(false);
            });
        })
        .catch();
    } else if (activeStep === 2) {
      axios
        .post("/admin-changeOrderProgress", {
          orderId: OrderId,
          progress: 75,
        })
        .then(() => {
          setActiveStep(3);
          setnext(false);
        })
        .catch(() => {
          setnext(false);
        });
    } else if (activeStep === 3) {
      axios
        .post("/admin-markOrderAsCompleted", { orderId: OrderId })
        .then((response) => {
          axios
            .post("/admin-changeOrderProgress", {
              orderId: OrderId,
              progress: 100,
            })
            .then(() => {
              setActiveStep(4);
              setnext(false);
            })
            .catch(() => {
              setnext(false);
            });
        })
        .catch();
    }
  };
  const handlePrevStep = (OrderId) => {
    setback(true);
    if (activeStep === 4) {
      axios
        .post("/admin-changeOrderProgress", {
          orderId: OrderId,
          progress: 75,
        })
        .then(() => {
          setActiveStep(3);
          setback(false);
        })
        .catch(() => {
          setback(false);
        });
    } else if (activeStep === 3) {
      axios
        .post("/admin-markOrderAsShipped", { orderId: OrderId })
        .then((response) => {
          axios
            .post("/admin-changeOrderProgress", {
              orderId: OrderId,
              progress: 50,
            })
            .then(() => {
              setActiveStep(2);
              setback(false);
            })
            .catch(() => {
              setback(false);
            });
        })
        .catch();
    } else if (activeStep === 2) {
      axios
        .post("/admin-markOrderAsPacked", { orderId: OrderId })
        .then((response) => {
          axios
            .post("/admin-changeOrderProgress", {
              orderId: OrderId,
              progress: 25,
            })
            .then(() => {
              setActiveStep(1);
              setback(false);
            })
            .catch(() => {
              setback(false);
            });
        })
        .catch();
    } else if (activeStep === 1) {
      axios
        .post("/admin-changeOrderProgress", {
          orderId: OrderId,
          progress: 0,
        })
        .then(() => {
          setActiveStep(0);
          setback(false);
        })
        .catch(() => {
          setback(false);
        });
    }
  };
  const [payload, setpayload] = useState(false);
  const sendSellerPay = () => {
    setpayload(true);
    axios
      .post("/admin-sendSellerPayment", {
        orderId: params.orderId,
      })
      .then((response) => {
        setpayload(false);
        setpaid(true);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const [trackLoad, setTrackLoad] = useState(false);
  const updateOrder = () => {
    setTrackLoad(true);
    axios
      .post("/admin-updateOrder", {
        orderId: params.orderId,
        externalTrackingLink: trackLink,
      })
      .then((response) => {
        setTrackLoad(false);
        console.log(response.data);
      })
      .catch((error) => {
        setTrackLoad(false);
        console.log(error.response.data);
      });
  };
  return (
    <>
      {load ? (
        <Stack
          direction="column"
          spacing={3}
          sx={{ width: "100%", padding: "10px" }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1" className={classes.root}>
              ORDER ID :
            </Typography>
            <Chip label={order._id} color="primary" size="small" />
          </Stack>
          {/* ================= Book Details ===================== */}
          <Stack direction="row" spacing={5}>
            <Avatar
              alt={order.title}
              src={order.photo}
              sx={{ height: 500, width: 300 }}
              variant="rounded"
            />
            <List
              subheader={
                <ListSubheader className={classes.root}>
                  Book Details
                </ListSubheader>
              }
            >
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Book ID"
                  secondary={order.bookId}
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Book Name"
                  secondary={order.title}
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Book Author"
                  secondary={order.author}
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Book Selling Price"
                  secondary={
                    <>
                      <i className="fas fa-rupee-sign"></i> {order.price}
                    </>
                  }
                />
              </ListItem>
            </List>
            {/* ================================================= */}
            <List
              subheader={
                <ListSubheader className={classes.root}>
                  Customer Details
                </ListSubheader>
              }
            >
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Customer ID"
                  secondary={order.customerId}
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Customer Name"
                  secondary={order.customerName}
                />
              </ListItem>
              <Divider />
              <List
                subheader={
                  <ListSubheader className={classes.root}>
                    Customer Address
                  </ListSubheader>
                }
              >
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Address"
                    secondary={order.customerAddress.address}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="State"
                    secondary={order.customerAddress.state}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="City"
                    secondary={order.customerAddress.city}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Zip Code"
                    secondary={order.customerAddress.zipCode}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Contact"
                    secondary={
                      <>
                        <Chip
                          label={order.customerAddress.phoneNo}
                          size="small"
                          icon={<CallIcon />}
                          color="primary"
                        />{" "}
                        {order.customerAddress.altPhoneNo ? (
                          <Chip
                            label={order.customerAddress.altPhoneNo}
                            size="small"
                            icon={<CallIcon />}
                            color="primary"
                          />
                        ) : null}
                      </>
                    }
                  />
                </ListItem>
              </List>
            </List>
            {/* ================================================= */}
            <List
              subheader={
                <ListSubheader className={classes.root}>
                  Seller Details
                </ListSubheader>
              }
            >
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Seller ID"
                  secondary={order.sellerId}
                />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon>
                  <NextIcon />
                </ListItemIcon>
                <ListItemText
                  className={classes.root}
                  primary="Seller Name"
                  secondary={order.sellerName}
                />
              </ListItem>
              <Divider />
              <List
                subheader={
                  <ListSubheader className={classes.root}>
                    Seller Address
                  </ListSubheader>
                }
              >
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Address"
                    secondary={order.sellerAddress.address}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="State"
                    secondary={order.sellerAddress.state}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="City"
                    secondary={order.sellerAddress.city}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Zip Code"
                    secondary={order.sellerAddress.zipCode}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Contact"
                    secondary={
                      <>
                        <Chip
                          label={order.sellerAddress.phoneNo}
                          size="small"
                          icon={<CallIcon />}
                          color="primary"
                        />{" "}
                        {order.sellerAddress.altPhoneNo ? (
                          <Chip
                            label={order.sellerAddress.altPhoneNo}
                            size="small"
                            icon={<CallIcon />}
                            color="primary"
                          />
                        ) : null}
                      </>
                    }
                  />
                </ListItem>
              </List>
            </List>
          </Stack>
          {/* ==================================================================================== */}
          <Stack direction="row" spacing={5} justifyContent="center">
            <List
              subheader={
                <ListSubheader className={classes.root}>
                  Order Details
                </ListSubheader>
              }
            >
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Item Price"
                    secondary={
                      <>
                        <i className="fas fa-rupee-sign" /> {order.price}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Purchase Quantity"
                    secondary={order.purchaseQty}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Shipping Charges"
                    secondary={
                      <>
                        <i className="fas fa-rupee-sign" />{" "}
                        {order.shippingCharges}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Order Total"
                    secondary={
                      <>
                        <i className="fas fa-rupee-sign" /> {order.orderTotal}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </List>
            {/* ============================================================= */}
            <List
              subheader={
                <ListSubheader className={classes.root}>
                  Payment Details
                </ListSubheader>
              }
            >
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Payment Mode"
                    secondary={
                      <Chip
                        label={order.paymentMode}
                        size="small"
                        color="default"
                      />
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Payment Status"
                    secondary={
                      <Chip
                        label={order.paymentStatus}
                        color={
                          order.paymentStatus === "Pending"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                      />
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Paid To Seller"
                    secondary={
                      <Chip
                        label={order.isSellerPaid ? "YES" : "NO"}
                        color={order.isSellerPaid ? "success" : "error"}
                        size="small"
                      />
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <NextIcon />
                  </ListItemIcon>
                  <ListItemText
                    className={classes.root}
                    primary="Order Total"
                    secondary={
                      <>
                        <i className="fas fa-rupee-sign" /> {order.orderTotal}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Stack>

          <Typography variant="h4">
            <strong>Tracking Details</strong>
          </Typography>
          <Stack direction="row" spacing={5}>
            <TextField
              className={classes.root}
              label="External Order Tracking Link"
              // helperText="Add External Order Tracking Link for Customer"
              variant="standard"
              sx={{ width: 400 }}
              onChange={(e) => settrackLink(e.target.value)}
              value={trackLink}
              focused
            />
            <LoadingButton
              loading={trackLoad}
              loadingPosition="end"
              endIcon={<NextIcon />}
              variant="contained"
              color="primary"
              className={classes.root}
              onClick={updateOrder}
              size="small"
            >
              Add Link
            </LoadingButton>
          </Stack>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            className={classes.root}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div>
            {activeStep === steps.length ? (
              <div></div>
            ) : (
              <div
                style={{
                  padding: "10px",
                  textAlign: "center",
                  color: "#1dff02",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {getStepContent(activeStep)}
              </div>
            )}
          </div>
          <div
            style={{
              width: "100%",
              justifyContent: "space-evenly",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Button
              className={classes.root}
              variant="contained"
              color="primary"
              onClick={() => handlePrevStep(order._id)}
              disabled={activeStep === 0}
            >
              {back ? (
                <>
                  <CircularProgress
                    style={{
                      color: "white",
                      height: "15px",
                      width: "15px",
                      fontWeight: "bold",
                    }}
                  />
                  &nbsp;&nbsp;
                </>
              ) : (
                <></>
              )}
              Back
            </Button>

            <Button
              className={classes.root}
              variant="contained"
              color="primary"
              onClick={() => handleNextStep(order._id)}
              disabled={activeStep === 4}
            >
              {next ? (
                <>
                  <CircularProgress
                    style={{
                      color: "white",
                      height: "15px",
                      width: "15px",
                      fontWeight: "bold",
                    }}
                  />
                  &nbsp;&nbsp;
                </>
              ) : (
                <></>
              )}
              {activeStep === steps.length - 1 ? "Finish" : "Next Step"}
            </Button>
          </div>

          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            {activeStep < 4 ? (
              <div
                className="cancel-order-button"
                id={order._id}
                onClick={(e) => {
                  handelCancelOrder(e.target.id);
                }}
              >
                <i
                  className={cls.Cls}
                  style={{ fontSize: "16px", color: "white" }}
                />
                &nbsp;&nbsp;{cls.msg}
              </div>
            ) : null}
            <LoadingButton
              loading={payload}
              loadingPosition="end"
              endIcon={paid ? <CheckIcon /> : <NextIcon />}
              variant="outlined"
              color="success"
              className={classes.root}
              onClick={sendSellerPay}
              disabled={paid}
            >
              {paid ? "Paid To Seller" : "Send Payment to Seller"}
            </LoadingButton>
            {paid ? (
              <Typography variant="body2" className={classes.root}>
                Successfully Paid to Seller. Amount Transfered to Seller Wallet.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      ) : (
        <LinearProgress sx={{ width: "100%" }} />
      )}
    </>
  );
};
export default OrderTracking;

/*
expectedDeliveryDate: "2022-01-03T15:47:14.978Z"
isSellerPaid: false
progress: 0
status: ['Order placed']
weightInGrams: 2400
*/
