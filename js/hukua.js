"use strict";

var get = function (selector) {
    return document.querySelector(selector);
};

// 节流函数
var throttleFn = function throttleFn(fn, interval, _this, args) {
    var timeId = null;
    return function () {
        if (timeId !== null) return;

        timeId = setTimeout(function () {
            fn.apply(this, args);
            timeId = null;
        }, interval);
    };
};

var ajaxGet = function ajaxGet(url) {
    return new Promise(function (resolve, reject) {
        var DONE = 4;
        var OK = 200;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject("ERROR:" + xhr.status);
                }
            }
        };
    });
};

var getShuffleIndexArr = function getShuffleIndexArr(n) {
    var count = 0;

    var arr = Array.from({ length: n }).map(function () {
        return count++;
    });

    for (var i = arr.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));

        var t = arr[randomIndex];
        arr[randomIndex] = arr[i];
        arr[i] = t;
    }

    return arr;
};

// 移动端菜单切换
{
    (function () {
        var header = get("#js-header");
        var menuTopbar = get("#js-mobile-topbar");
        var menuBtn = get("#js-menu-btn");
        var mobileMenuContainer = get("#js-mobile-menu-container");
        var mobileMenuWrapper = get("#js-mobile-menu-wrapper");

        var disableScroll = function disableScroll(e) {
            e.preventDefault();
        };

        var enableMenu = function enableMenu() {
            // fix移动端chrome地址栏栏造成的高度不准确
            mobileMenuWrapper.style.height = window.innerHeight + "px";

            // 禁止滚动
            mobileMenuWrapper.addEventListener("touchmove", disableScroll);

            // 展开动画第一阶段开始时的高度
            var fromHeight = header.clientHeight - window.scrollY > menuTopbar.clientHeight ? header.clientHeight - window.scrollY : menuTopbar.clientHeight;

            // 展开动画
            mobileMenuContainer.style.height = fromHeight + "px";
            var activeTl = new TimelineLite();
            activeTl.to(mobileMenuContainer, 0.2, {
                width: "100%",
                ease: Power1.easeOut
            }).to(mobileMenuContainer, 0.2, {
                height: "100%",
                ease: Power1.easeOut
            });
        };

        var disableMenu = function disableMenu(e) {
            // 移除滚动锁定
            mobileMenuWrapper.removeEventListener("touchmove", disableScroll);

            // 如果点击链接，不处理
            if (e.target.nodeName === "A") {
                return;
            } // 关闭动画第一阶段开始时的高度
            var toHeight = header.clientHeight - window.scrollY > menuTopbar.clientHeight ? header.clientHeight - window.scrollY : menuTopbar.clientHeight;

            // 关闭动画
            var activeTl = new TimelineLite();
            TweenLite.defaultEase = Power1.easeOut;
            activeTl.to(mobileMenuContainer, 0.2, {
                height: toHeight + "px"
            }).to(mobileMenuContainer, 0.2, {
                width: 0
            });
        };

        menuBtn.addEventListener("click", enableMenu);
        mobileMenuWrapper.addEventListener("click", disableMenu);
    })();
}