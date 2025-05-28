

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  let os = 'Unknown OS';
  if (platform.startsWith('Win')) os = 'Windows';
  else if (platform.startsWith('Mac')) os = 'macOS';
  else if (/Android/.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = 'iOS';
  else if (/Linux/.test(platform)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/Chrome/.test(userAgent)) browser = 'Chrome';
  else if (/Safari/.test(userAgent)) browser = 'Safari';
  else if (/Firefox/.test(userAgent)) browser = 'Firefox';
  else if (/Edge/.test(userAgent)) browser = 'Edge';

  return {
    os,
    browser,
    userAgent,
  };
};

export default getDeviceInfo;