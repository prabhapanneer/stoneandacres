let url = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?3224';
let s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = url;
let options = {
  "enabled": true,
  "chatButtonSetting": {
    "backgroundColor":"#00e785",
    "ctaText":"Chat with us",
    "borderRadius":"25",
    "marginLeft": "0",
    "marginRight": "20",
    "marginBottom": "20",
    "ctaIconWATI":false,
    "position":"right"
  },
  "brandSetting": {
    "brandName":"Stone and Acres",
    "brandSubTitle":"",
    "brandImg":"https://www.stoneandacres.com/assets/images/highlighted_section.jpg",
    "welcomeText":"Hi there!\nHow can I help you?",
    "messageText":"Hi! Help me find my perfect plot!",
    "backgroundColor":"#00e785",
    "ctaText":"Chat with us",
    "borderRadius":"25",
    "autoShow":false,
    "phoneNumber":"918098855855"
  }
};
s.onload = function () {
  CreateWhatsappChatWidget(options);
};
let x = document.getElementsByTagName('script')[0];
x.parentNode.insertBefore(s, x);