import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import BackArrow from "../../components/backArrow/BackArrow";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Box,
  Typography,
  Stack,
  Container,
  Button,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import icircle from "../../images/info-circle.svg";
import searchLogo from "../../images/searchLogo.svg";
import dashdot from "../../images/practise/threedot.svg";
import res2 from "../../images/res2.svg";
import OTD1 from "../../images/OTD1.svg";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Modal } from "@mui/material";
import { AuthProvider } from "../../util/AuthContext";
import "./Cart.css";
import { useSelector } from "react-redux";
import NoResult from "../../components/NoResult";
import CartItem from "../../components/CartItem";
import { ToastContainer, toast } from "react-toastify";
import phoneLogo from "../../images/phoneLogo.svg";
import "react-toastify/dist/ReactToastify.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../helpers/axiosInstance";
import { getCookie } from "../../util/cookieAuth";
import { queryClient } from "../../helpers/queryClient";
import useSuperMarket from "../../hooks/useSuperMarket";
import successGif from "../../images/successGif.gif";
import { clearCart } from "../../util/slice/CartSlice";
import { useDispatch } from "react-redux";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import { Dialog } from "@mui/material";
import { Slide } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CartReceipt from "../../components/CartReceipt";
import FormattedPrice from "../../components/FormattedPrice";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Cart = () => {
  const { AuthAxios } = axiosInstance();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  console.log(cart);

  const [text, setText] = useState(false);
  const [phoneNo, setPhoneNo] = useState("");

  const [phoneNoError, setPhoneNoError] = useState(false);
  const handlePhoneNoBlur = () => {
    if (!phoneNo) {
      setPhoneNoError("Please enter your phone number");
      setText(true);
    }
  };
  const handlePhoneNoChange = (event) => {
    const value = event.target.value;
    setPhoneNo(value);
    if (!value) {
      setPhoneNoError("Please enter your phone number");
      setText(true);
    } else if (!/^0([89][01]|70)\d{8}$/i.test(value)) {
      setText(true);
      setPhoneNoError("Invalid phone number");
    } else {
      setText(false);
      setPhoneNoError("");
    }
  };

  const [pins, setPins] = useState(["", "", "", ""]);
  const [newPins, setNewPins] = useState(["", "", "", ""]);
  const [confirmNewPins, setConfirmNewPins] = useState(["", "", "", ""]);
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [superMarketKey, setSuperMarketKey] = useState("");
  const [successResponse, setSuccessResponse] = useState(false);
  const [deleteCart, setDeleteCart] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [orderData, setOrderData] = useState();

  const superMarket = useSuperMarket(superMarketKey);

  const calculateTotalPrice = () => {
    if (cart.length === 0) {
      return 0;
    }

    let totalPrice = 0;

    cart.forEach((cartItem) => {
      totalPrice += cartItem.price;
    });

    return totalPrice;
  };
  const totalPrice = calculateTotalPrice();
  const handleOpen = () => {
    cart.length !== 0 ? setOpen(true) : notify("you have no item in your cart");
  };
  const handleOpen2 = () => setOpen2(true);
  const handleOpen3 = () => {
    setOpen3(true);
  };
  const handleOpen4 = () => {
    setOpen4(true);
  };
  const handleClose = () => setOpen(false);
  const handleClose2 = () => setOpen2(false);
  const handleClose3 = () => setOpen3(false);
  const handleClose4 = () => setOpen4(false);
  const handleClose5 = () => {
    setSuccessResponse(false);
    setOpen2(false);
    setOpen(false);
  };
  const handleClose6 = () => {
    setDeleteCart(false);
  };
  const handleClose7 = () => {
    setOpenReceipt(false);
  };
  const handleChange = (index, value) => {
    // Ensure that the value is only one digit
    if (value.length > 1) return;
    const newPins = [...pins];
    newPins[index] = value;
    setPins(newPins);
  };
  const handleNewPinChange = (index, value) => {
    // Ensure that the value is only one digit
    if (value.length > 1) return;
    const firstNewPins = [...newPins];
    firstNewPins[index] = value;
    setNewPins(firstNewPins);
  };
  const handleConfirmNewPins = (index, value) => {
    // Ensure that the value is only one digit
    if (value.length > 1) return;
    const newPins = [...confirmNewPins];
    newPins[index] = value;
    setConfirmNewPins(newPins);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    handleClose6();
  };

  // handle create pin starts

  const sendPasswordToEndpoint = async (pin) => {
    const token = getCookie("authToken");
    try {
      const response = await AuthAxios({
        url: "/transaction/create-pin",
        method: "POST",
        data: { pin },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const noti = error.response.data.message;
      setTimeout(() => {
        notify(noti);
      }, 1000);
      throw new Error(error.response);
    }
  };

  const mutation = useMutation(sendPasswordToEndpoint, {
    onSuccess: (response) => {
      console.log(response);
      queryClient.invalidateQueries("passwords"); // Optionally, invalidate relevant queries after the mutation
    },
    onError: (response) => {
      console.log(response);

      setNewPins(["", "", "", ""]);
      setConfirmNewPins(["", "", "", ""]);
    },
  });

  const handleCreatePin = () => {
    // Check if all the PINs have been entered
    const allPinsEntered = newPins.every((pin) => pin !== "");
    const allConfirmedPinsEntered = confirmNewPins.every((pin) => pin !== "");

    if (allPinsEntered || allConfirmedPinsEntered) {
      if (JSON.stringify(newPins) === JSON.stringify(confirmNewPins)) {
        // api call
        const matchedPasswordString = newPins.join("");
        mutation.mutate(matchedPasswordString);
      } else {
        notify("Pins do not match! try again");
      }
    } else {
      notify("Please enter all four PIN digits.");
    }
  };

  // Handle create pin ends

  // complete order starts

  const sendPinToEndpoint = async (pin) => {
    const token = getCookie("authToken");
    try {
      const response = await AuthAxios({
        url: "/transaction/verify-pin",
        method: "POST",
        data: { pin },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const noti = error.response.data.message;
      setTimeout(() => {
        notify(noti);
      }, 1000);
      throw new Error(error.response);
    }
  };
  const sendDataToEndpoint = async (payLoad) => {
    const result = JSON.stringify(payLoad, null, 2);

    const objData = { payload: result };
    const token = getCookie("authToken");
    try {
      const response = await AuthAxios({
        url: "/cart-supermarket",
        method: "POST",
        data: objData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const noti = Array.isArray(error.response.data.message)
        ? error.response.data.message[0]
        : error.response.data.message;
      setTimeout(() => {
        notify(noti);
      }, 1000);
      throw new Error(error.response);
    }
  };

  const mutationOrder = useMutation(sendPinToEndpoint, {
    onSuccess: (response) => {
      // api to save cart
      mutationData.mutate(payLoad);
      queryClient.invalidateQueries("pins"); // Optionally, invalidate relevant queries after the mutation
    },
    onError: (response) => {
      console.log(response);

      setPins(["", "", "", ""]);
    },
  });
  const mutationData = useMutation(sendDataToEndpoint, {
    onSuccess: (response) => {
      console.log(response);
      setOrderData(response);
      setSuccessResponse(true);
      setTimeout(() => {
        setSuccessResponse(false);
        setOpenReceipt(true);
      }, 3000);
    },
    onError: (response) => {
      console.log(response);

      setNewPins(["", "", "", ""]);
      setConfirmNewPins(["", "", "", ""]);
    },
  });

  const handleSubmit = () => {
    // Check if all the PINs have been entered
    const allPinsEntered = pins.every((pin) => pin !== "");

    if (allPinsEntered) {
      const matchedPins = pins.join("");
      // Api for verify pin
      mutationOrder.mutate(matchedPins);
    } else {
      notify("Please enter all four PIN digits.");
    }
  };

  // Dara to send to complete order endpoint start

  const productId = cart.map((item) => {
    return { productId: item.productId };
  });

  const commission = (0.5 / 100) * totalPrice;
  const superMarketId = superMarket.data ? superMarket.data.id : "";
  // test

  const payLoad = {
    commission: commission,
    supermarketId: superMarketId,
    category: "supermarket",
    totalAmount: totalPrice,
    paymentType: "WALLET",
    orders: productId,
  };
  // end test

  // data to send to complete order endpoint end
  // complete order ends

  const notify = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const navigate = useNavigate();
  const currentTheme = useTheme();

  useEffect(() => {
    const val = localStorage.getItem("myData");
    if (val) {
      setSuperMarketKey(val);
    }
  }, []);

  return (
    <AuthProvider>
      <Box
        sx={{
          maxWidth: "31%",
          mx: "auto",
          marginTop: "1rem",
          maxWidth: { xs: "100%", sm: "100%", md: "31%" },
        }}
      >
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            mx: "auto",
            width: { xs: "96%", sm: "70%", md: "100%" },
            padding: 0,
          }}
        >
          <Box>
            <BackArrow destination="/home" />
          </Box>

          <Box
            sx={{
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: "2rem",
            }}
          >
            <Typography
              sx={{
                fontFamily: "raleWay",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              My Cart
            </Typography>

            {cart.length != 0 && (
              <Button
                onClick={() => setDeleteCart(true)}
                sx={{
                  width: "35%",
                  textTransform: "capitalize",
                  padding: "0",
                  background:
                    currentTheme.palette.type === "light"
                      ? "#dc0019"
                      : "#dc0019",
                  padding: "10px",
                  borderRadius: "8px",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                  fontFamily: "raleWay",
                }}
              >
                Clear Cart
              </Button>
            )}
          </Box>

          {/*Card  */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            {cart.length === 0 ? (
              <NoResult
                notification="You have no item in your cart"
                smallText="proceed to scan to add items"
                buttonText="Proceed"
                linkText="/scan"
              />
            ) : (
              cart.map((item) => <CartItem item={item} key={item.id} />)
            )}
          </Box>
          {/* Card end */}

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              my: "1.5rem",
            }}
          >
            {cart.length != 0 && (
              <Button
                onClick={() => navigate("/scan")}
                sx={{
                  width: "95%",
                  padding: "10px",
                  borderRadius: "8px",
                  color:
                    currentTheme.palette.type === "light"
                      ? "#dc0019"
                      : "#dc0019",
                  borderColor: "#dc0019",
                  fontFamily: "raleWay",
                  fontWeight: "900",
                  "&:hover": {
                    borderColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                }}
                variant="outlined"
              >
                <ControlPointRoundedIcon sx={{ fontSize: "16px", mx: "5px" }} />{" "}
                Scan another item
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "4rem",
              justifyContent: "start",
              minHeight: "40vh",
              padding: "1rem",
              width: "100%",
              textAlign: "center",
              boxShadow: " 2px -18px 93px -5px rgba(0,0,0,0.1) inset",
              marginBottom: "0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                  fomtWeight: "900",
                  fontSize: "16px",
                }}
              >
                Grand Total
              </Typography>
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                  fomtWeight: "900",
                  fontSize: "16px",
                }}
              >
                <FormattedPrice amount={totalPrice} />
              </Typography>
            </Box>

            <Box>
              <Button
                onClick={handleOpen}
                sx={{
                  background:
                    currentTheme.palette.type === "light"
                      ? "#dc0019"
                      : "#dc0019",
                  padding: "10px",
                  width: "100%",
                  borderRadius: "8px",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                  fontFamily: "raleWay",
                }}
              >
                Proceed to payment
              </Button>
            </Box>
          </Box>

          {/* Modal 1  modal for purchase*/}
          <Modal
            className="scale-in-center"
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card
              sx={{
                position: "absolute",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                bottom: 0,
                width: { xs: "100%", sm: "70%", lg: "31%" },
                left: { xs: "0", sm: "14%", lg: "34%" },
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "18.78px",
                  marginY: "1rem",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                }}
                id="modal-modal-title"
              >
                Sure to Purchase?
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 900,
                    fontSize: "13px",
                    lineHeight: "18.78px",
                    color:
                      currentTheme.palette.type === "light" ? "#000" : "#fff",
                  }}
                >
                  Are you sure want to purchse these items for{" "}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 600,
                    fontSize: "13px",
                    lineHeight: "18.78px",
                    mx: "3px",
                    color:
                      currentTheme.palette.type === "light"
                        ? "#C57600"
                        : "#C57600",
                  }}
                >
                  &#8358;{totalPrice}?{" "}
                </Typography>
              </Box>

              <Button
                onClick={handleOpen2}
                sx={{
                  background:
                    currentTheme.palette.type === "light"
                      ? "#dc0019"
                      : "#dc0019",
                  width: "95%",
                  padding: "10px",
                  borderRadius: "8px",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                  fontFamily: "raleWay",
                }}
              >
                Yes,Purchase
              </Button>
              <Button
                onClick={() => handleClose()}
                sx={{
                  width: "95%",
                  padding: "10px",
                  borderRadius: "8px",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                  borderColor: "#dc0019",
                  fontFamily: "raleWay",
                  "&:hover": {
                    borderColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                }}
                variant="outlined"
              >
                No,Go back
              </Button>
            </Card>
          </Modal>
          {/* Modal 1 ends*/}

          {/* Modal 2*  modal for complete order */}
          <Modal
            className="scale-in-center"
            open={open2}
            onClose={handleClose2}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card
              sx={{
                position: "absolute",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                bottom: 0,
                width: { xs: "100%", sm: "70%", lg: "31%" },
                left: { xs: "0", sm: "14%", lg: "34%" },
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "18.78px",
                  marginY: "1rem",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                }}
                id="modal-modal-title"
              >
                Enter your transaction pin to complete your order.
              </Typography>

              <Box
                sx={{
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    margin: "auto",
                    width: "100%",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {pins.map((pin, index) => (
                      <TextField
                        sx={{
                          "& input": {
                            fontSize: "3rem",
                            padding: "0",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#CACACA",
                            },
                            "&:hover fieldset": {
                              borderColor: "#CACACA", // Set the border color on hover here
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#C57600", // Set the border color on focus here
                            },
                          },
                        }}
                        key={index}
                        variant="outlined"
                        type="password"
                        value={pin}
                        onChange={(e) => handleChange(index, e.target.value)}
                        inputProps={{
                          maxLength: 1, // Limit input to one character
                          style: { textAlign: "center" }, // Center-align the input
                        }}
                      />
                    ))}
                  </Box>

                  <Button
                    onClick={handleSubmit}
                    disabled={mutationData.isLoading}
                    sx={{
                      background:
                        currentTheme.palette.type === "light"
                          ? "#dc0019"
                          : "#dc0019",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor:
                          currentTheme.palette === "light"
                            ? "#dc0019"
                            : "#dc0019",
                      },
                      fontFamily: "raleWay",
                    }}
                  >
                    {mutationData.isLoading ? (
                      <CircularProgress size="1.2rem" sx={{ color: "white" }} />
                    ) : (
                      "Complete Order"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleClose2()}
                    sx={{
                      width: "100%",
                      marginTop: "-0.9rem",
                      padding: "10px",
                      borderRadius: "8px",
                      color:
                        currentTheme.palette.type === "light" ? "#000" : "#fff",
                      borderColor: "#dc0019",
                      fontFamily: "raleWay",
                      "&:hover": {
                        borderColor:
                          currentTheme.palette === "light"
                            ? "#dc0019"
                            : "#dc0019",
                      },
                    }}
                    variant="outlined"
                  >
                    Go back
                  </Button>

                  <Box>
                    <Button
                      onClick={() => handleOpen3()}
                      sx={{
                        fontFamily: "raleWay",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#DC0019",
                      }}
                    >
                      Forget PIN
                    </Button>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        my: "1rem",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "raleWay",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#d7d7d7",
                        }}
                      >
                        Don't have a pin yet?
                      </Typography>

                      <Typography
                        onClick={() => handleOpen4()}
                        sx={{
                          fontFamily: "raleWay",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#dc0019",
                        }}
                      >
                        Create one
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Modal>
          {/* Modal 2 ends*/}

          {/* Modal 3   modal for forget pin*/}
          <Modal
            className="scale-in-center"
            open={open3}
            onClose={handleClose3}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card
              sx={{
                position: "absolute",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                bottom: 0,
                width: { xs: "100%", sm: "70%", lg: "31%" },
                left: { xs: "0", sm: "14%", lg: "34%" },
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 900,
                    fontSize: "16px",
                    lineHeight: "18.78px",
                    marginY: "1rem",
                    color:
                      currentTheme.palette.type === "light" ? "#000" : "#fff",
                  }}
                  id="modal-modal-title"
                >
                  Reset PIN
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 600,
                    fontSize: "13px",
                    lineHeight: "18.78px",
                    marginY: "1rem",
                    color:
                      currentTheme.palette.type === "light"
                        ? "#C57600"
                        : "#C57600",
                  }}
                  id="modal-modal-title"
                >
                  (1/3)
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 400,
                    fontSize: "13px",
                    lineHeight: "18.78px",
                    textAlign: "center",
                    color:
                      currentTheme.palette.type === "light"
                        ? "#000"
                        : "#d7d7d7",
                  }}
                  id="modal-modal-title"
                >
                  Please enter the phone number you registered with Check
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 900,
                    fontSize: "14px",
                    lineHeight: "18.78px",
                    marginLeft: "1em",
                    color:
                      currentTheme.palette.type === "light"
                        ? "#000"
                        : "#d7d7d7",
                  }}
                  id="modal-modal-title"
                >
                  Phone Number
                </Typography>

                <TextField
                  sx={{
                    width: { xs: "300px", sm: "100%", md: "327px" },
                    mx: "auto",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: `${text ? "#DC0019" : "#CACACA"}`, // Set the desired border color here
                      },
                      "&:hover fieldset": {
                        borderColor: `${text ? "#DC0019" : "#CACACA"}`, // Set the border color on hover here
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: `${text ? "#DC0019 " : "#C57600"}`, // Set the border color on focus here
                      },
                    },
                  }}
                  onChange={handlePhoneNoChange}
                  onBlur={handlePhoneNoBlur}
                  value={phoneNo}
                  required
                  helperText={phoneNoError && <span>{phoneNoError}</span>}
                  placeholder="Enter your phone number"
                  variant="outlined"
                  id="phone-number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment>
                        <img src={phoneLogo} alt="e-logo" />
                        &nbsp;&nbsp;
                      </InputAdornment>
                    ),
                  }}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    "aria-label": "weight",
                  }}
                />
              </Box>

              <Box
                sx={{
                  flexDirection: "column",
                  display: "flex",
                  alignItems: "center",
                  minWidth: "100%",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <Button
                  sx={{
                    background:
                      currentTheme.palette.type === "light"
                        ? "#dc0019"
                        : "#dc0019",
                    width: "95%",
                    padding: "10px",
                    borderRadius: "8px",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor:
                        currentTheme.palette === "light"
                          ? "#dc0019"
                          : "#dc0019",
                    },
                    fontFamily: "raleWay",
                  }}
                >
                  Proceed
                </Button>
                <Button
                  onClick={() => handleClose3()}
                  sx={{
                    width: "95%",
                    padding: "10px",
                    borderRadius: "8px",
                    color:
                      currentTheme.palette.type === "light" ? "#000" : "#fff",
                    borderColor: "#dc0019",
                    fontFamily: "raleWay",
                    "&:hover": {
                      borderColor:
                        currentTheme.palette === "light"
                          ? "#dc0019"
                          : "#dc0019",
                    },
                  }}
                  variant="outlined"
                >
                  Go back
                </Button>
              </Box>
            </Card>
          </Modal>
          {/* Modal 3 ends*/}

          {/* Modal 4*   modal for create pin */}
          <Modal
            className="scale-in-center"
            open={open4}
            onClose={handleClose4}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card
              sx={{
                position: "absolute",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                bottom: 0,
                width: { xs: "100%", sm: "70%", lg: "31%" },
                left: { xs: "0", sm: "14%", lg: "34%" },
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontWeight: 900,
                    fontSize: "16px",
                    lineHeight: "18.78px",
                    marginY: "1rem",
                    color:
                      currentTheme.palette.type === "light" ? "#000" : "#fff",
                  }}
                  id="modal-modal-title"
                >
                  You are almost set!, just your transaction Pin
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    gap: "0.8rem",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "raleWay",
                      fontWeight: 900,
                      fontSize: "16px",
                      lineHeight: "18.78px",
                      color:
                        currentTheme.palette.type === "light" ? "#000" : "#fff",
                    }}
                    id="modal-modal-title"
                  >
                    New Pin
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {newPins.map((pin, index) => (
                      <TextField
                        sx={{
                          "& input": {
                            fontSize: "3rem",
                            padding: "0",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#CACACA",
                            },
                            "&:hover fieldset": {
                              borderColor: "#CACACA", // Set the border color on hover here
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#C57600", // Set the border color on focus here
                            },
                          },
                        }}
                        key={index}
                        variant="outlined"
                        type="password"
                        value={pin}
                        onChange={(e) =>
                          handleNewPinChange(index, e.target.value)
                        }
                        inputProps={{
                          maxLength: 1, // Limit input to one character
                          style: { textAlign: "center" }, // Center-align the input
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    gap: "0.8rem",
                    my: "1rem",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "raleWay",
                      fontWeight: 900,
                      fontSize: "16px",
                      lineHeight: "18.78px",
                      color:
                        currentTheme.palette.type === "light" ? "#000" : "#fff",
                    }}
                    id="modal-modal-title"
                  >
                    Re-enter New Pin
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {confirmNewPins.map((pin, index) => (
                      <TextField
                        sx={{
                          "& input": {
                            fontSize: "3rem",
                            padding: "0",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#CACACA",
                            },
                            "&:hover fieldset": {
                              borderColor: "#CACACA", // Set the border color on hover here
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#C57600", // Set the border color on focus here
                            },
                          },
                        }}
                        key={index}
                        variant="outlined"
                        type="password"
                        value={pin}
                        onChange={(e) =>
                          handleConfirmNewPins(index, e.target.value)
                        }
                        inputProps={{
                          maxLength: 1, // Limit input to one character
                          style: { textAlign: "center" }, // Center-align the input
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  flexDirection: "column",
                  display: "flex",
                  alignItems: "center",
                  minWidth: "100%",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <Button
                  onClick={handleCreatePin}
                  disabled={mutation.isLoading}
                  sx={{
                    background:
                      currentTheme.palette.type === "light"
                        ? "#dc0019"
                        : "#dc0019",
                    width: "95%",
                    padding: "10px",
                    borderRadius: "8px",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor:
                        currentTheme.palette === "light"
                          ? "#dc0019"
                          : "#dc0019",
                    },
                    fontFamily: "raleWay",
                  }}
                >
                  {mutation.isLoading ? (
                    <CircularProgress size="1.2rem" sx={{ color: "white" }} />
                  ) : (
                    "Proceed"
                  )}
                </Button>
                <Button
                  onClick={() => handleClose4()}
                  sx={{
                    width: "95%",
                    padding: "10px",
                    borderRadius: "8px",
                    color:
                      currentTheme.palette.type === "light" ? "#000" : "#fff",
                    borderColor: "#dc0019",
                    fontFamily: "raleWay",
                    "&:hover": {
                      borderColor:
                        currentTheme.palette === "light"
                          ? "#dc0019"
                          : "#dc0019",
                    },
                  }}
                  variant="outlined"
                >
                  Go back
                </Button>
              </Box>
            </Card>
          </Modal>
          {/* Modal 4 ends*/}

          {/* Modal 5* success response */}
          <Dialog
            fullScreen
            open={successResponse}
            onClose={handleClose5}
            TransitionComponent={Transition}
          >
            <Box
              sx={{
                flexDirection: "column",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100% ",
              }}
            >
              {/* <img className="gif-img" src={successGif} alt="gif" /> */}
              <CheckRoundedIcon
                sx={{
                  fontSize: "4rem",
                  background: "#008000",
                  borderRadius: "50% ",
                  padding: "1rem",
                  color: "white",
                  marginBottom: "1.7rem",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  fontWeight: 900,
                  fontSize: "16px",
                  lineHeight: "18.78px",
                  marginY: "1rem",
                  textAlign: "center",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                }}
                id="modal-modal-title"
              >
                Payment Successful!
              </Typography>
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "18.78px",
                  textAlign: "center",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                }}
                id="modal-modal-title"
              >
                Generating Receipt.....
              </Typography>
            </Box>
          </Dialog>
          {/* Modal 5  ends*/}

          {/* Modal 6* clear cart modal */}
          <Modal
            classetsName="scale-in-center"
            open={deleteCart}
            onClose={handleClose6}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card
              sx={{
                position: "absolute",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                bottom: 0,
                width: { xs: "100%", sm: "70%", lg: "31%" },
                left: { xs: "0", sm: "14%", lg: "34%" },
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "raleWay",
                  fontWeight: 900,
                  fontSize: "16px",
                  lineHeight: "18.78px",
                  marginY: "1rem",
                  textAlign: "center",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                }}
                id="modal-modal-title"
              >
                Are you sure you want to clear all items in your cart? This
                cannot be undone.
              </Typography>

              <Button
                onClick={() => handleClearCart()}
                sx={{
                  background:
                    currentTheme.palette.type === "light"
                      ? "#dc0019"
                      : "#dc0019",
                  width: "95%",
                  padding: "10px",
                  borderRadius: "8px",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                  fontFamily: "raleWay",
                }}
              >
                Yes, Clear Cart
              </Button>
              <Button
                onClick={() => handleClose6()}
                sx={{
                  width: "95%",
                  padding: "10px",
                  borderRadius: "8px",
                  color:
                    currentTheme.palette.type === "light" ? "#000" : "#fff",
                  borderColor: "#dc0019",
                  fontFamily: "raleWay",
                  "&:hover": {
                    borderColor:
                      currentTheme.palette === "light" ? "#dc0019" : "#dc0019",
                  },
                }}
                variant="outlined"
              >
                No,Go back
              </Button>
            </Card>
          </Modal>
          {/* Modal 6  clear ends*/}

          {/* Modal 7 receipt dialog */}
          <Dialog
            fullScreen
            open={openReceipt}
            onClose={handleClose7}
            TransitionComponent={Transition}
          >
            <Box
              sx={{
                flexDirection: "column",
                display: "flex",
                alignItems: "start",
                justifyContent: "start",
                width: "100%",
                height: "100% ",
              }}
            >
              <CartReceipt
                cart={cart ? cart : []}
                totalPrice={totalPrice ? totalPrice : ""}
                orderData={orderData ? orderData : ""}
              />
            </Box>
          </Dialog>
          {/* Modal 7 receipt dialog  ends*/}

          <ToastContainer />
        </Container>

        {/* NAVBAR */}

        <Navbar />
      </Box>
    </AuthProvider>
  );
};

export default Cart;
