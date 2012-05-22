window.isPostcardInitialized = false;

function initialize() {

    // postcard logic set up
    window.postcard = Postcard();

    // default picture
    setPicture ("images/html5 logo.png");

    // event handlers
    $("#selectImage").bind("change", function (event, ui) {
        var imgPath = $("#selectImage").val();

        setPicture(imgPath);

    });

    $("#sliderContrast, #sliderBrithness, #sliderBW").bind("change", function () {
        applyParamsThrottled();
    });

    $("#btnLoadPicture").bind("click", function () {
        loadPicture();
    });
}

function reset() {
    Pixastic.revert(getTargetImage());
    $("#sliderContrast").val(0).slider('refresh');
    $("#sliderBrithness").val(0).slider('refresh');
    $("#sliderBW").val("off").slider('refresh');
}

function setPicture(imgSrc)
{
    window.currentImg = imgSrc;

    window.isPostcardInitialized = false;

    reset();

    var img = getTargetImage();
    img.style.setProperty("position", "relative", "important");
    img.onload = function()
    {
        Pixastic.process(getTargetImage(), "brightness", {brightness: 0, contrast: 0});

        setTimeout(function() {
            postcard.show();
            window.isPostcardInitialized = true;
            getTargetImage().style.setProperty("position", "absolute", "important");
            img.style.setProperty("position", "absolute", "important");
        }, 0);

    }
    img.src = imgSrc;

}

function loadPicture (source)
{
    if (!navigator || !navigator.camera) {
        console.log("Oops, no access to device Camera api.");
        return;
    }

    source = source | navigator.camera.PictureSourceType.PHOTOLIBRARY;

    navigator.camera.getPicture(
        function(data) {
            setPicture("data:image/jpeg;base64," + data)
        },
        function(e) {
            console.log("Error getting picture: " + e);
        },
        { quality: 50, destinationType: navigator.camera.DestinationType.DATA_URL, sourceType : source});
}

function getTargetImage() {
    //if (!window.img)
    window.img = document.getElementById("imgToProcess");

    return window.img;
}

function applyparams() {
    var contrastVal = $("#sliderContrast").val() / 50,
        brightnessVal = $("#sliderBrithness").val(),
        isBlackAndWhite = $("#sliderBW").val() === "on";

    Pixastic.revert(getTargetImage());

    if (isBlackAndWhite) {
        Pixastic.process(getTargetImage(), "desaturate", {average: false});
    }

    Pixastic.process(getTargetImage(), "brightness", {brightness: brightnessVal, contrast: contrastVal});

    if (isPostcardInitialized) {
        postcard.requestFrameRender();
    }

}

//applyParamsThrottled = $.debounce(applyparams, 200);
applyParamsThrottled = $.throttle(applyparams, 400);


function onConfirm(button) {
    if (button == 1) {
        setPicture(window.currentImg);
    }
}

function showConfirm() {
    navigator.notification.confirm(
        'Are you sure?', // message
        onConfirm, // callback to invoke with index of button pressed
        'Image will be reset', // title
        'Reset,Cancel'          // buttonLabels
    );
}

$(document).ready(function () {

    initialize();

});