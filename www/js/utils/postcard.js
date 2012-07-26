/// <reference path="./theme.js" />
/// <reference path="./default.js" />
/// <reference path="./systemInformation.js" />

Postcard = (function () {

    "use strict";

    // aliases
    //var trp = Theme.resources.postcard;
    //    var trpfb = trp.fixedBounds;
    //var trpm = trp.marks;

    // required DOM elements
    var postcardContainer = document.getElementById("postcardContainer");
    var postcard = document.getElementById("postcard");
    var hint = document.getElementById("hint");
    var message = document.getElementById("message");

    // store canvases and contexts in those
    var clearCanvas, clearContext;
    var clearPathCanvas, clearPathContext;
    var coverCanvas, coverContext;
    var maskCanvas, maskContext;
    var messageCanvas, messageContext;

    // image mask cache
    var maskImageDataCache;
    var imagesLoaded = false;

    // we're getting events from parent div, so we need placement information to adjust
    var bounds = updateBounds();

    // track user input
    var pointerDown = false;
    var stroke = [];

    coverCanvas = getTargetImage();

    var w, h;

    //var requestFrameRender = $.throttle(requestFrameRender2, 200);

    var requestFrameRender = requestFrameRender2;

    // external initilization
    function show(message) {
        createCompositePhoto();
        setPersonalizedMessage(message);
        showHint();
    }

    // show/hide the hint
    function showHint() {
        //hint.style.opacity = 1.0;
    }

    function hideHint() {
        //hint.style.opacity = 0;
    }


    // request to render single frame on demand
    function requestFrameRender2() {


        Animation.getRequestAnimationFrame(renderCompositePhoto);
    }

    function setPersonalizedMessage(messageString) {
        //message.textContent = messageString;
        message.innerHTML = messageString;
    }

    function reset() {
        stroke = [];
    }

    // get personalized greeting message
    function getPersonalizedMessage(mode) {

        var returnMessage = "Hello";
        // detect browser to display custom message
        //        var browser = SystemInformation.getBrowser();
        //        var returnMessage = (mode === "alternate") ? trp.message.alternate : trp.message[browser];
        //
        //        // or if we're using personalized message - check if we're using predefined
        //        var customMessage = window.location.hash;
        //        if (customMessage &&
        //            customMessage.length &&
        //            customMessage.length > 1) {
        //            // check predefined message
        //
        //            if (customMessage.length === 6 &&
        //                customMessage[0] === "#" &&
        //                customMessage[1] === "!") {
        //                returnMessage = trp.message[customMessage];
        //            } else {
        //                // display the personal message
        //                returnMessage = unescape(customMessage.substr(1, customMessage.length - 1));
        //            }
        //        }

        return returnMessage;
    }

    // render user input and compose layers
    function renderCompositePhoto() {
        var ro = Gfx.getDefaultRenderOptions();
        ro.context = clearPathContext;
        Gfx.renderPath(stroke, ro);
        stroke = [];

        Gfx.composeLayers(pipeline, composeOptions);

        coverCanvas = getTargetImage();

        // compose layers
        var pipeline = [
        // composing on cleared particles canvas
                    clearContext,
        // particles on a postcard
                    coverCanvas,
        // cleared path
                    clearPathCanvas
        // mask image
        //maskCanvas
                    ];
        // "subtract" cleared path
        //var composeOptions = ["", "", "destination-out", "destination-out"];

        var composeOptions = ["", "", "destination-out"];
        Gfx.composeLayers(pipeline, composeOptions);
    }

    function createCanvas() {
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        return canvas;
    }

    function createCoverImage() {

        postcard.style.setProperty("width", w + "px", 'important');
        postcard.style.setProperty("height", h + "px", 'important');

        postcardContainer.style.setProperty("width", w + "px", 'important');
        postcardContainer.style.setProperty("height", h + "px", 'important');

        createClearCanvas();

    }


    function createClearCanvas() {
        // cleared path
        clearPathCanvas = createCanvas();
        clearPathContext = clearPathCanvas.getContext("2d");

        // compose result - in DOM and visible
        clearCanvas = createCanvas();
        clearCanvas.className = "clearCanvas";
        clearCanvas.id = "imgToProcess2";
        clearCanvas.style.zIndex = "1";
        postcard.appendChild(clearCanvas);
        clearContext = clearCanvas.getContext("2d");

        imagesLoaded = true;

        renderCompositePhoto();
    }

    // correct by bounding rectangle
    function calcOffset(evt) {
        return {
            x: evt.clientX - bounds.left,
            y: evt.clientY - bounds.top + $(window).scrollTop()
        }
    }

    // mouse and touch (IE) handlers
    function pointerDownHandler(evt) {

        if (!isWithinBounds(evt.clientX, evt.clientY)) {
            return false;
        }

        evt.preventDefault();
        evt.stopPropagation();

        pointerDown = true;
        stroke.push(calcOffset(evt));
        requestFrameRender();
        //App.hidePersonalMessageEditor();
        return false;

    }

    function pointerMoveHandler(evt) {
        if (!isWithinBounds(evt.clientX, evt.clientY)) {
            return false;
        }

        evt.preventDefault();
        if (evt.buttons > 0) { pointerDown = true; }
        if (pointerDown) {
            stroke.push(calcOffset(evt));
            requestFrameRender();
        }

        return false;
    }

    function pointerUpHandler(evt) {

        if (!isWithinBounds(evt.clientX, evt.clientY)) {
            return false;
        }

        evt.preventDefault();
        pointerDown = false;
        stroke = [];
    }

    function createCompositePhoto() {
        // if we're repopulating the photo - flush childNodes
        if (postcard.childNodes.length > 0) {
            postcard.innerHTML = "";
            maskImageDataCache = null;
            imagesLoaded = false;
        };

        coverCanvas = getTargetImage();

        w = coverCanvas.clientWidth,
            h = coverCanvas.clientHeight;

        bounds = updateBounds();

        createCoverImage();

        // touch events (IE) if supported
        if (window.navigator.msPointerEnabled) {
            postcardContainer.addEventListener("MSPointerDown", pointerDownHandler);
            postcardContainer.addEventListener("MSPointerUp", pointerUpHandler);
            postcardContainer.addEventListener("MSPointerCancel", pointerUpHandler);
            postcardContainer.addEventListener("MSPointerMove", pointerMoveHandler);
        } else {
            window.addEventListener("mousedown", pointerDownHandler);
            window.addEventListener("mouseup", pointerUpHandler);
            window.addEventListener("mouseleave", pointerUpHandler);
            window.addEventListener("mousemove", pointerMoveHandler);
        }
    }

    // update postcard bounds to handle events
    function updateBounds() {
        var p = $("#postcard");
        var position = p.position();

        bounds = {
            width: w,
            height: h,
            left: position.left,
            right: position.left + w,
            top: position.top,
            bottom: position.top + h
        }

        return bounds;
    }

    function isWithinBounds(x, y) {
        // check if particle is within bounds of postcard
        y += $(window).scrollTop();
        if (x < bounds.left) return false;
        if (y < bounds.top) return false;
        if (x > bounds.right) return false;
        if (y > bounds.bottom) return false;
        return true;
    }


    return {
        "show": show,
        "updateBounds": updateBounds,
        "isWithinBounds": isWithinBounds,
        "setPersonalizedMessage": setPersonalizedMessage,
        "requestFrameRender": requestFrameRender2,
        "reset": reset
    };
});