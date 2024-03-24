import { useContext } from "react";
import Modal from "./UI/Modal";
import CartContext from "../store/CartContext";
import { currencyFormatter } from "../utils/formatting";
import Input from "./UI/Input";
import Button from "./UI/Button";
import UserProgressContext from "../store/UserProgressContext";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const userProgressCtx = useContext(UserProgressContext);

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      street: "",
      postalCode: "",
      city: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .max(15, "Must be 15 characters or less")
        .required("Please enter first name"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Please enter email address"),
      street: Yup.string().required("Please enter street"),
      postalCode: Yup.string()
        .min(6, "Must be 6 characters or greater")
        .required("Please enter postal code"),
      city: Yup.string().required("Please enter city"),
    }),
    onSubmit: (values) => {
      //   alert(JSON.stringify(values, null, 2));
      console.log(values);
    },
  });

  function handleClose() {
    userProgressCtx.hideCheckout();
    formik.resetForm();
  }

  function handleSubmit(event) {
    event.preventDefault();
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
          name="fullName"
          onChange={formik.handleChange}
          value={formik.values.fullName}
        />
        {formik.touched.fullName && formik.errors.fullName ? (
          <div className="error-message">{formik.errors.fullName}</div>
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
        <p className="modal-actions">
          <Button type="button" textOnly onClick={handleClose}>
            Close
          </Button>
          <Button type="submit">Submit Order</Button>
        </p>
      </form>
    </Modal>
  );
}
