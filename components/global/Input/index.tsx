import { cn } from "helpers/utils";
import { InputProps } from "@/types/global/InputProps";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

type ValidationResult = boolean | string;

export type ValidationRules = {
	email: (value: string, label?: string) => ValidationResult;
	required: (value: string, label?: string) => ValidationResult;
	phone: (value: string, label?: string) => ValidationResult;
	altPhone: (value: string, label?: string) => ValidationResult;
	password: (value: string, label?: string) => ValidationResult;
	otp: (value: string, label?: string) => ValidationResult;
	confirmPassword: (value: string, label?: string) => ValidationResult;
	noSpaces: (value: string, label?: string) => ValidationResult;
};

const Input = ({
	label,
	placeholder,
	type = "text",
	id,
	onChange = () => {},
	max,
	min,
	pattern,
	rules = [],
	name,
	autoComplete = "off",
	disabled = false,
	theme = "outline",
	focused = false,
	optional = false,
	className = "",
	showPassword: _showPassword = false,
	left = null,
	right = null,
	paddingLeft = "",
	paddingRight = "",
	customError,
	customMessage,
	hint,
	...rest
}: InputProps) => {
	const [errorMessage, setErrorMessage] = useState("");
	const [showPassword, setShowPassword] = useState(_showPassword);
	const [passwordCheck, setPasswordCheck] = useState({
		uppercase: false,
		lowercase: false,
		number: false,
		special: false,
		length: false,
	});
	const [passwordIsDirty, setPasswordIsDirty] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const methods = useFormContext();

	const {
		watch,
		formState: { isDirty },
	} = methods;

	const validationRules: ValidationRules = {
		required: (value, label = "") => {
			if (value !== null && value !== undefined && value !== "") return true;
			else return `The ${label} field is required`;
		},
		email: (value, label = "") => {
			const match = value
				.toString()
				.match(
					/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
				);
			return match ? true : `The ${label} field has to be a valid email`;
		},
		password: (value, label = "") => {
			const messages = [];

			if (!/[A-Z]/g.test(value)) {
				messages.push("an uppercase letter");
			}
			if (!/[a-z]/g.test(value)) {
				messages.push("a lowercase letter");
			}
			if (!/[0-9]/g.test(value)) {
				messages.push("a number");
			}
			if (!/[*|\":<>[\]{}`\\()';@&$#!]/g.test(value)) {
				messages.push("a special character");
			}
			if (value.length < 8) {
				messages.push("at least 8 digits");
			}

			const message =
				messages.length > 1
					? `${messages.slice(0, -1).join(", ")} and ${messages.slice(-1)}`
					: `${messages.join(", ")}`;
			return messages.length > 0
				? `The ${label} field must have ${message}`
				: true;
		},
		otp: (value, label = "") => {
			return value.length === 6
				? true
				: `The ${label} field must be of length 6`;
		},
		phone: (value, label = "") => {
			return value.length <= 10
				? true
				: `The ${label} field must be less than or equal to 12 digits`;
		},
		altPhone: (value, label = "") => {
			return value.length <= 12
				? true
				: `The ${label} field must be less than or equal to 12 digits`;
		},
		confirmPassword: (value, label = "") => {
			return value === watch("password")
				? true
				: `The ${label} field must be equal to the Password field`;
		},
		noSpaces: (value, label = "") => {
			return !value.includes(" ")
				? true
				: `The ${label} field is not allowed to contain spaces`;
		},
	};

	const computedRules = rules.reduce<{
		[index: string]: (param: string) => ValidationResult;
	}>((map, key) => {
		map[key] = (value) => validationRules[key](value, label || name);
		return map;
	}, {});

	const { error } = methods.getFieldState(name);

	const register = methods.register(name, {
		validate: computedRules,

		pattern: pattern
			? {
					value: new RegExp(pattern),
					message:
						errorMessage ||
						`The ${label} field doesn't satisfy the regex ${pattern}`,
			  }
			: undefined,
		min: min
			? {
					value: min,
					message: `The ${label} field must be greater than or equal to ${min}`,
			  }
			: undefined,
		max: max
			? {
					value: max,
					message: `The ${label} field must be less than or equal to ${max}`,
			  }
			: undefined,
	});

	useEffect(() => {
		if (focused) {
			inputRef.current?.focus();
		}
	}, [focused]);

	const watchPassword = watch("password");

	useEffect(() => {
		setPasswordCheck({
			...passwordCheck,
			uppercase: /[A-Z]/g.test(watchPassword),
			lowercase: /[a-z]/g.test(watchPassword),
			number: /[0-9]/g.test(watchPassword),
			special: /[*|\":<>[\]{}`\\()';@&$#!]/g.test(watchPassword),
			length: watchPassword?.length >= 8,
		});
	}, [watchPassword]);

	const inputTheme = (theme: string) => {
		switch (theme) {
			case "outline":
				return `p-4 bg-white text-tc-dark border-[1.5px] ${
					disabled ? "bg-[#F4FEFB]" : ""
				} ${
					error
						? "border-status-error-100 focus:border-status-error-100"
						: "border-[#545f7d26] focus:border-primary"
				}`;
			case "plain":
				return "p-4 bg-transparent border-[1.5px] border-transparent";
			default:
				return "bg-white border-[1.5px] border-gray-300";
		}
	};

	return (
		<label htmlFor={id} className='flex flex-col relative'>
			{label && (
				<span className='w-full font-medium text-sm text-left leading-5 capitalize text-tc-main mb-2'>
					{label}
				</span>
			)}
			<input
				onFocus={() => setPasswordIsDirty(true)}
				{...register}
				className={cn(
					"w-full active:border-primary text-tc-main focus:bg-pc-02 text-sm h-[50px] overflow-hidden font-normal rounded-[5px] outline-none",
					inputTheme(theme),
					className,
					type === "password" ? "pr-16" : "",
					left ? paddingLeft : "",
					right ? paddingRight : ""
				)}
				type={showPassword ? "text" : type}
				placeholder={placeholder}
				id={id}
				onChange={(event) => {
					register.onChange(event);
					onChange(event);
				}}
				ref={(e) => {
					register.ref(e);
					inputRef.current = e;
				}}
				disabled={disabled}
				{...rest}
			/>

			{type === "password" && (
				<button
					type='button'
					onClick={() => setShowPassword(!showPassword)}
					className={cn(
						"absolute focus:border-primary focus:outline-primary flex items-center justify-center h-[50px] w-12 right-[2px] top-[10px] cursor-pointer",
						{ "top-[2px]": !label }
					)}>
					<div className='text-secondary uppercase text-xs pr-4'>
						{!showPassword ? "Show" : "Hide"}
					</div>
				</button>
			)}

			{right && (
				<div
					className={cn(
						"absolute flex items-center justify-center right-0 top-[8px]",
						{ "top-0": !label }
					)}>
					{right}
				</div>
			)}

			{left && (
				<div
					className={cn(
						"absolute flex items-center justify-center left-0 top-[8px]",
						{ "top-0": !label }
					)}>
					{left}
				</div>
			)}

			{!rules.includes("password") && (error || customError) && (
				<span className='text-xs text-left mt-2 text-status-error-100'>
					*{customError || error.message}
				</span>
			)}

			{passwordIsDirty && rules.includes("password") && (
				<div className='text-xs mt-2 text-left [&>*:nth-child(even)]:text-right grid grid-cols-2 gap-x-2 xl:gap-x-8 gap-y-1'>
					<div
						className={
							passwordCheck.uppercase
								? "text-status-success-100"
								: "text-status-error-100"
						}>
						*<span className='hidden sm:inline'>Must contain</span>{" "}
						<span className='capitalize sm:lowercase'>an</span> uppercase letter
					</div>
					<div
						className={
							passwordCheck.lowercase
								? "text-status-success-100"
								: "text-status-error-100"
						}>
						*<span className='hidden sm:inline'>Must contain</span>{" "}
						<span className='capitalize sm:lowercase'>a</span> lowercase letter
					</div>
					<div
						className={
							passwordCheck.number
								? "text-status-success-100"
								: "text-status-error-100"
						}>
						*<span className='hidden sm:inline'>Must contain</span>{" "}
						<span className='capitalize sm:lowercase'>a</span> number
					</div>
					<div
						className={
							passwordCheck.special
								? "text-status-success-100"
								: "text-status-error-100"
						}>
						*<span className='hidden sm:inline'>Must contain</span>{" "}
						<span className='capitalize sm:lowercase'>a</span> special character
					</div>
					<div
						className={
							passwordCheck.length
								? "text-status-success-100"
								: "text-status-error-100"
						}>
						*<span className='hidden sm:inline'>Must contain</span>{" "}
						<span className='capitalize sm:lowercase'>at</span> least 8
						characters
					</div>
				</div>
			)}

			{customMessage && (
				<span className='text-xs text-left mt-2 text-status-success-100'>
					{customMessage}
				</span>
			)}

			{hint && !customError && !error && !customMessage && (
				<span className='text-xs text-left mt-2 text-tc-03'>{hint}</span>
			)}
		</label>
	);
};

export default Input;
