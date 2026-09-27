"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-20 text-[#071A33]">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8B04A] text-4xl">
          ✓
        </div>

        <h1 className="text-4xl font-bold">
          Order placed successfully!
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Thank you for your order. Your order has been sent successfully.
        </p>

        {orderId && (
          <p className="mt-6 font-semibold">
            Order ID:{" "}
            <span className="text-[#E8B04A]">{orderId}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/orders"
            className="rounded-full bg-[#071A33] px-8 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
          >
            My Orders
          </Link>

          <Link
            href="/books"
            className="rounded-full border border-[#071A33] px-8 py-3 font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={<div>Loading order...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}