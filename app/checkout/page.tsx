
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import {
  Country,
  State,
  City,
} from "country-state-city";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("DZ");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const countries = Country.getAllCountries();

  const selectedCountry = countries.find(
    (country) => country.isoCode === countryCode
  );

  const states = countryCode
    ? State.getStatesOfCountry(countryCode)
    : [];

  const cities =
    countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode)
      : [];

  useEffect(() => {
    if (!user && cart.length > 0) {
      router.push("/signin?redirect=/checkout");
    }
  }, [user, cart.length, router]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCountryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCountryCode(event.target.value);
    setStateCode("");
    setCity("");
    setOrderError("");
  };

  const handleStateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStateCode(event.target.value);
    setCity("");
    setOrderError("");
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/signin?redirect=/checkout");
      return;
    }

    setOrderError("");

    if (!phone.trim()) {
      setOrderError("Please enter your phone number.");
      return;
    }

    if (!countryCode) {
      setOrderError("Please select your country.");
      return;
    }

    if (!stateCode) {
      setOrderError("Please select your state or region.");
      return;
    }

    if (!city.trim()) {
      setOrderError("Please enter or select your city.");
      return;
    }

    if (!address.trim()) {
      setOrderError("Please enter your full delivery address.");
      return;
    }

    // Validate phone according to the selected country
    const phoneNumber = parsePhoneNumberFromString(
      phone.trim(),
      countryCode as CountryCode
    );

    if (!phoneNumber || !phoneNumber.isValid()) {
      setOrderError(
        "Please enter a valid phone number for the selected country."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user.email,

          // Customer information
          firstName: user.firstName,
          lastName: user.lastName,

          // Use international format when possible
          phone: phoneNumber.number,

          // Delivery information
          country: selectedCountry?.name || countryCode,
          region:
            states.find(
              (state) => state.isoCode === stateCode
            )?.name || stateCode,
          city: city.trim(),
          address: address.trim(),

          // Order information
          items: cart,
          total: subtotal,
        }),
      });

      const data = await response.json();

      // --------------------------------------------------
      // Handle API errors
      // --------------------------------------------------

      if (!response.ok) {
        if (response.status === 409) {
          setOrderError(
            data.error ||
              "Insufficient stock. Please reduce the quantity of one or more books."
          );
        } else {
          setOrderError(
            data.error || "Unable to create the order."
          );
        }

        setIsSubmitting(false);
        return;
      }

      console.log("Order created:", data.order);

      clearCart();

      router.push(
        `/order-success?orderId=${data.order.orderId}`
      );
    } catch (error) {
      console.error("Create order error:", error);

      setOrderError(
        "Unable to connect to the server. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-5xl">🛒</div>

          <h1 className="mt-4 text-3xl font-bold text-[#071A33]">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Add some books before proceeding to checkout.
          </p>

          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-[#E8B04A] px-7 py-2.5 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
          >
            Browse Books
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            BookStore
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#071A33] md:text-4xl">
            Checkout
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Complete your order
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Customer Information */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#071A33]">
              Customer Information
            </h2>

            <div className="space-y-4">

              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  value={user?.firstName || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#071A33] outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  value={user?.lastName || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#071A33] outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#071A33] outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  Phone Number
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+213 555 123 456"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  Enter a valid phone number for the selected country.
                </p>
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  Country
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  id="country"
                  value={countryCode}
                  onChange={handleCountryChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                >
                  {countries.map((country) => (
                    <option
                      key={country.isoCode}
                      value={country.isoCode}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* State / Wilaya */}
              <div>
                <label
                  htmlFor="state"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  State / Wilaya / Region
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  id="state"
                  value={stateCode}
                  onChange={handleStateChange}
                  disabled={states.length === 0}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-100"
                >
                  <option value="">
                    Select a state / region
                  </option>

                  {states.map((state) => (
                    <option
                      key={state.isoCode}
                      value={state.isoCode}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / Commune */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  City / Commune
                  <span className="ml-1 text-red-500">*</span>
                </label>

                {cities.length > 0 ? (
                  <select
                    id="city"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    disabled={!stateCode}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-100"
                  >
                    <option value="">
                      Select a city / commune
                    </option>

                    {cities.map((item, index) => (
                      <option
                        key={`${item.name}-${index}`}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="Enter your city / commune"
                    disabled={!stateCode}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-100"
                  />
                )}
              </div>

              {/* Full Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  Full Address
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Example: Cité 120 logements, bâtiment 4, appartement 12"
                  required
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#071A33]">
              Order Summary
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-semibold text-[#071A33]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-[#B8892D]">
                    {(item.price * item.quantity).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    DZD
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#071A33]">
                  Total
                </span>

                <span className="text-xl font-extrabold text-[#B8892D]">
                  {subtotal.toLocaleString("fr-FR")} DZD
                </span>
              </div>

              {/* Error */}
              {orderError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    Unable to place order
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {orderError}
                  </p>
                </div>
              )}

              {/* Place Order */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="mt-5 w-full rounded-full bg-[#071A33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating Order..."
                  : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

