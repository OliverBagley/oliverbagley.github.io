// Kiosk API of Kiosk Pro Basic (8.3.6055)

if (typeof(___kp_executeURL) !== "function")
{
	// Common JS-ObjC-Bridge API:
	function ___kp_executeURL(url)
	{
		var iframe = document.createElement("IFRAME");
		iframe.setAttribute("src", url);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}
}

// Kiosk Version API:
if (typeof(kp_VersionAPI_requestFullVersion) !== "function")
{
	function kp_VersionAPI_requestFullVersion(callback)
	{
		___kp_executeURL("kioskpro://kp_VersionAPI_requestFullVersion?" + encodeURIComponent(callback));
	}
}


if (typeof(kp_VersionAPI_requestMainVersion) !== "function")
{
	function kp_VersionAPI_requestMainVersion(callback)
	{
		___kp_executeURL("kioskpro://kp_VersionAPI_requestMainVersion?" + encodeURIComponent(callback));
	}
}


if (typeof(kp_VersionAPI_requestBuildNumber) !== "function")
{
	function kp_VersionAPI_requestBuildNumber(callback)
	{
		___kp_executeURL("kioskpro://kp_VersionAPI_requestBuildNumber?" + encodeURIComponent(callback));
	}
}


if (typeof(kp_VersionAPI_requestProductName) !== "function")
{
	function kp_VersionAPI_requestProductName(callback)
	{
		___kp_executeURL("kioskpro://kp_VersionAPI_requestProductName?" + encodeURIComponent(callback));
	}
}


if (typeof(kp_VersionAPI_requestProductNameWithFullVersion) !== "function")
{
	function kp_VersionAPI_requestProductNameWithFullVersion(callback)
	{
		___kp_executeURL("kioskpro://kp_VersionAPI_requestProductNameWithFullVersion?" + encodeURIComponent(callback));
	}
}


// Identification API:
if (typeof(kp_requestKioskId) !== "function")
{
	function kp_requestKioskId(callback)
	{
		___kp_executeURL("kioskpro://kp_requestKioskId?" + encodeURIComponent(callback));
	}
}


if (typeof(kp_Identification_getGroupIDs) !== "function")
{
	function kp_Identification_getGroupIDs()
	{
		___kp_executeURL("kioskpro://kp_Identification_getGroupIDs");
	}
}


// File API:
if (typeof(writeToFile) !== "function")
{
	function writeToFile(fileName,data,callback)
	{
		___kp_executeURL("kioskpro://writeToFile?" + encodeURIComponent(fileName) + "&" + encodeURIComponent(data) + "&" + encodeURIComponent(callback));
	}
}


// AirPrinter API:
if (typeof(kp_AirPrinter_requestStateOfSupporting) !== "function")
{
	function kp_AirPrinter_requestStateOfSupporting()
	{
		___kp_executeURL("kioskpro://kp_AirPrinter_requestStateOfSupporting");
	}
}


if (typeof(kp_AirPrinter_print) !== "function")
{
	function kp_AirPrinter_print()
	{
		___kp_executeURL("kioskpro://kp_AirPrinter_print");
	}
}


if (typeof(kp_AirPrinter_printPdf) !== "function")
{
	function kp_AirPrinter_printPdf(filename)
	{
		___kp_executeURL("kioskpro://kp_AirPrinter_printPdf?" + encodeURIComponent(filename));
	}
}


// Common Printer API:
if (typeof(print) !== "function")
{
	function print()
	{
		___kp_executeURL("kioskpro://print");
	}
}



// Set hooks are available:
window.kioskpro_hooks_available = 1;