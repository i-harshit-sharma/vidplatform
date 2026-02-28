"use client";
import React from "react";
import { redirect } from "next/navigation";
import { useActionState } from "react";
import loginUser from "@/actions/loginUser";
import Link from "next/link";

export default function page() {
    const [state, action, isPending] = useActionState(loginUser, null);
	return (
		<div>
            {state?.status === 200 && redirect("/")}
			<h1>Login Page</h1>
			<form action={action}>
				<input
					type="email"
					name="email"
					placeholder="Email"
					required
					defaultValue={state?.email}
				/>
				<input
					type="password"
					name="password"
					placeholder="Password"
					required
				/>
				<button type="submit" disabled={isPending}>
					Login
				</button>
			</form>
			{state && <p>{state.message}</p>}
			<Link href="/register">Don't have an account? Register here.</Link>
		</div>
	);
}
