import { useContext } from "react";
import Modal from "./UI/Modal";
import CartContext from "../store/CartContext";
import { currencyFormatter } from "../utils/formatting";
import Input from "./UI/Input";
import Button from "./UI/Button";
import UserProgressContext from "../store/UserProgressContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import useHttps from "../hooks/useHttps";
import Error from "./Error";

const requestConfig = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const userProgressCtx = useContext(UserProgressContext);

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  const {
    data,
    isLoading: isSending,
    error,
    sendRequest,
    clearData,
  } = useHttps("http://localhost:3000/orders", requestConfig);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      street: "",
      postalCode: "",
      city: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(15, "Must be 15 characters or less")
        .required("Please enter name"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Please enter email address"),
      street: Yup.string().required("Please enter street"),
      postalCode: Yup.string()
        .min(5, "Must be 5 characters or greater")
        .required("Please enter postal code"),
      city: Yup.string().required("Please enter city"),
    }),
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  function handleClose() {
    userProgressCtx.hideCheckout();
    formik.resetForm();
  }

  function handleFinish() {
    userProgressCtx.hideCheckout();
    formik.resetForm();
    cartCtx.clearItem();
    clearData();
  }

  async function handleSubmit(values) {
    await sendRequest(
      JSON.stringify({
        order: {
          items: cartCtx.items,
          customer: values,
        },
      })
    );
  }

  let action = (
    <>
      <Button type="button" textOnly onClick={handleClose}>
        Close
      </Button>
      <Button type="submit">Submit Order</Button>
    </>
  );

  if (isSending) {
    action = <span>Sending Order Data..</span>;
  }

  if (data && !error) {
    return (
      <Modal
        open={userProgressCtx.progress === "checkout"}
        onClose={handleFinish}
      >
        <h2>Success!</h2>
        <p>Your order was submitted successfully.</p>
        <p>We will get back to you via email within few minutes</p>
        <p className="modal-actions">
          <Button onClick={handleFinish}>Okay</Button>
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      open={userProgressCtx.progress === "checkout"}
      onClose={userProgressCtx.progress === "checkout" ? handleClose : null}
    >
      <form onSubmit={formik.handleSubmit}>
        <h2>Checkout</h2>
        <p>Total Amount: {currencyFormatter.format(cartTotal)} </p>
        <Input
          label="Full Name"
          type="text"
          id="full-name"
          name="name"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        {formik.touched.name && formik.errors.name ? (
          <div className="error-message">{formik.errors.name}</div>
        ) : null}

        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="error-message">{formik.errors.email}</div>
        ) : null}

        <Input
          label="Street"
          type="text"
          id="street"
          name="street"
          onChange={formik.handleChange}
          value={formik.values.street}
        />
        {formik.touched.street && formik.errors.street ? (
          <div className="error-message">{formik.errors.street}</div>
        ) : null}

        <div className="control-row">
          <Input
            label="Postal Code"
            type="text"
            id="postal-code"
            name="postalCode"
            onChange={formik.handleChange}
            value={formik.values.postalCode}
          />
          <Input
            label="city"
            type="text"
            id="city"
            name="city"
            onChange={formik.handleChange}
            value={formik.values.city}
          />
        </div>
        <div className="control-row">
          {formik.touched.postalCode && formik.errors.postalCode ? (
            <div className="error-message">{formik.errors.postalCode}</div>
          ) : null}
          {formik.touched.city && formik.errors.city ? (
            <div className="error-message">{formik.errors.city}</div>
          ) : null}
        </div>
        {error && <Error title="Failed to submit data" message={error} />}
        <p className="modal-actions">{action}</p>
      </form>
    </Modal>
  );
}
