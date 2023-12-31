import React from "react";
import QrReader from "react-qr-scanner";
import { Box } from "@mui/material";
import useSuperMarketP from "../../hooks/useSuperMarketP";
import { Modal, Button, Card, Typography } from "@mui/material";
import alwaysp from "../../images/alwaysp.svg";
import { useTheme } from "@mui/material";
import vcart from "../../images/practise/vcart.svg";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../util/slice/CartSlice";
import { useSelector } from "react-redux";
import Quagga from "@ericblade/quagga2";

const Scanner = ({ superMarketId }) => {
  const cart = useSelector((state) => state.cart);

  const [result, setResult] = useState("");
  const dispatch = useDispatch();

  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState(1);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const superMarketP = useSuperMarketP(superMarketId, result ? result : "");

  const currentTheme = useTheme();
  const decrement = () => {
    if (count > 1 && count != 0) {
      setCount(count - 1);
    }
  };

  const defaultComputedPrice = !superMarketP.data?.price || !count ? 0 : null;
  const computedPrice = defaultComputedPrice
    ? defaultComputedPrice
    : superMarketP.data?.price * count;
  const defaultPrice =
    computedPrice && !defaultComputedPrice
      ? computedPrice
      : superMarketP.data?.price;

  const handleAddToCart = (data) => {
    const isValueInArray = cart.some((item) => item.id === data.id);

    if (isValueInArray) {
      notifyWarn("Item is already in cart");
      setOpen(false);
    } else {
      dispatch(addToCart({ ...data, price: defaultPrice, counter: count }));
      notify("Item added to cart");
      setOpen(false);
    }
  };

  const notify = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };
  const notifyWarn = (message) => {
    toast.warn(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#scanner-container"),
          constraints: {
            facingMode: "environment",
          },
          numOfWorkers: 4,
        },

        // frequency: 5,
        // locate: true,
        debug: true, // Set to true to see the debugging information
        decoder: {
          readers: ["ean_reader"], // Specify the barcode format(s) you want to scan
        },
      },
      (err) => {
        if (err) {
          console.error("Error initializing Quagga:", err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      setResult(data.codeResult.code);
      setCount(1);
      setOpen(true);
    });

    return () => {
      Quagga.stop();
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          border: "1px dashed black",
          padding: "0.5rem",
          borderRadius: "10px ",
        }}
      >
        <Box
          id="scanner-container"
          sx={{
            display: "none",
          }}
        ></Box>
        <QrReader
          delay={300}
          onError={(err) => console.error("Error scanning QR code:", err)}
          style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "20px" }}
          constraints={{
            video: { facingMode: "environment" },
          }}
        />
      </Box>

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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <Box>
              <Box sx={{ maxWidth: "30%", mx: "auto" }}>
                <img
                  src={
                    superMarketP.data ? (
                      superMarketP.data.productImage === null ? (
                        alwaysp
                      ) : (
                        superMarketP.data.productImage
                      )
                    ) : (
                      <CircularProgress size="10px" />
                    )
                  }
                  alt="always"
                />
              </Box>
            </Box>

            <Card
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "center",
                padding: "1rem 2rem",
                my: "0.5rem",
                background:
                  currentTheme.palette.type === "light" ? "#e8e5e5" : "#262626",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "3px",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  {superMarketP.data ? superMarketP.data.description : ""}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "raleWay",
                    fontSize: " 10px",
                    fontWeight: 400,
                  }}
                >
                  (size {superMarketP.data ? superMarketP.data.weight : ""})
                </Typography>
              </Box>
              {/* Counter */}
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button
                  size="small"
                  onClick={decrement}
                  sx={{
                    background: "#eff0f9",
                    color:
                      currentTheme.palette.type === "light" ? "#000" : "#000",
                    fontWeight: "900",
                    padding: "0",
                    width: "2px",
                    paddingLeft: "1ch",
                  }}
                  i
                >
                  -
                  <Typography
                    sx={{
                      fontFamily: "raleWay",
                      color:
                        currentTheme.palette.type === "light" ? "#000" : "#000",
                      fomtWeight: "900",
                      mx: "2ch",
                    }}
                  >
                    {count}
                  </Typography>
                </Button>

                <Box
                  onClick={() => setCount(count + 1)}
                  sx={{
                    background: "#ff0808",
                    color:
                      currentTheme.palette.type === "light" ? "#fff" : "#fff",
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    fontFamily: "raleWay",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "-10px",
                    zIndex: "1",
                  }}
                >
                  +
                </Box>
              </Box>

              {/* Counter ends */}
              <Typography
                sx={{
                  color: "#F79E1B",
                  fontFamily: "raleWay",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                &#8358;{superMarketP.data ? defaultPrice : ""}
              </Typography>
            </Card>

            <Button
              onClick={() =>
                handleAddToCart(superMarketP.data ? superMarketP.data : "")
              }
              sx={{
                height: "36px",
                background: "#F6473C",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                flexGrow: "1",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#F6473C", // Custom background color on hover
                },
                "&:active": {
                  backgroundColor: "#F6473C", // Custom background color on click
                },
              }}
            >
              <img src={vcart} alt="vcart" />
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "raleWay",
                  paddingTop: "7px",
                }}
              >
                Add to cart
              </Typography>
            </Button>
          </Box>
        </Card>
      </Modal>
    </>
  );
};

export default Scanner;
