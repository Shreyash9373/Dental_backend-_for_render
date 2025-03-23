import jwt from "jsonwebtoken"; // Missing import for jwt
import dashboardLogin from "../models/dashboardloginSchema.js";
import cookieOptions from "../constants.js";

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await dashboardLogin.findOne({ username });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid credentials or user does not exist",
      });
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Generate tokens
    const { accesstoken, refreshtoken } = await genAccessAndRefreshTokens(
      user._id
    );

    // Set cookies with tokens
    const accessTokenOptions = cookieOptions("access");
    const refreshTokenOptions = cookieOptions("refresh");

    return res
      .status(200)
      .cookie("accessToken", accesstoken, accessTokenOptions)
      .cookie("refreshToken", refreshtoken, refreshTokenOptions)
      .json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
        accessToken: accesstoken,
        refreshToken: refreshtoken,
        message: "User logged in successfully",
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Username and password are required",
    });
  }

  const existingUser = await dashboardLogin.findOne({ username });
  if (existingUser) {
    return res.json({
      success: false,
      message: "Username already exists with this username",
    });
  }

  const user = await dashboardLogin.create({
    username,
    password,
    role,
  });

  const createdUser = await dashboardLogin
    .findById(user._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    return res.json({ success: false, message: "Failed to create user" });
  }

  return res.status(201).json({
    success: true,
    createdUser,
    message: "User registered successfully",
  });
};

const logoutUser = async (req, res) => {
  const userId = req.user._id;

  await dashboardLogin.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "User logout successfully" });
};

const refreshAccessToken = async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized user request" });
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await dashboardLogin.findById(decodedToken?._id);

    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid Refresh token" });
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token is expired or used",
      });
    }

    return res.status(201).json({
      username: user.username,
      role: user.role,
      success: true,
      message: "Valid User",
    });

    // const { accesstoken, refreshtoken: newrefreshtoken } =
    //   await genAccessAndRefreshTokens(user._id);

    // const options = {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Only secure in production
    //   sameSite: "strict",
    // };

    // return res
    //   .status(200)
    //   .cookie("accessToken", accesstoken, options)
    //   .cookie("refreshToken", newrefreshtoken, options)
    //   .json({
    //     success: true,
    //     user: user,
    //     accessToken:accesstoken,
    //     refreshToken: newrefreshtoken,
    //     message: "User logged-in successfully",
    //   });
  } catch (error) {
    return res.json({ success: false, message: "Invalid refresh token" });
  }
};

const addMember = async (req, res) => {
  const { username, password, role } = req.body;
  const memberDataFormat = { username, role, password };
  const saveData = await dashboardLogin.create(memberDataFormat);
  if (saveData) {
    return res
      .status(200)
      .json({ success: true, message: "Member Added Successfully" });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Member not added Successfully" });
  }
};

const changeCurrentPassword = async (req, res) => {
  const { username, Password, confirmPassword } = req.body;

  if (Password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New password and confirm password must be the same",
    });
  }

  const user = await dashboardLogin.findById(req.user?._id);
  const checkPassword = await user.isPasswordCorrect(Password);

  // if (!checkPassword) {
  //   return res.json({ success: false, message: "Invalid old password" });
  // }

  user.password = Password;
  const response = await user.save({ validateBeforeSave: false });
  if (response) {
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Password not saved successfully" });
  }
};

export {
  login,
  register,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  addMember,
};
