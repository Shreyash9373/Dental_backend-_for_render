const genAccessAndRefreshTokens = async (user) => {
  try {
    // const user = await dashboardLogin.findById(userId);
    // if (!user) {
    //   throw new Error("Doctor not found");
    // }

    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while generating tokens");
  }
};

export { genAccessAndRefreshTokens };
