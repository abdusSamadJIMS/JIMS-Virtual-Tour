if (!Object["hasOwnProperty"]("values")) {
  Object["values"] = function (c) {
    return Object["keys"](c)["map"](function (d) {
      return c[d];
    });
  };
}
if (!String["prototype"]["startsWith"]) {
  String["prototype"]["startsWith"] = function (e, f) {
    f = f || 0x0;
    return this["indexOf"](e, f) === f;
  };
}
TDV["EventDispatcher"] = function () {
  this["_handlers"] = {};
};
TDV["EventDispatcher"]["prototype"]["bind"] = function (g, h) {
  if (!(g in this["_handlers"])) this["_handlers"][g] = [];
  this["_handlers"][g]["push"](h);
};
TDV["EventDispatcher"]["prototype"]["unbind"] = function (i, j) {
  if (i in this["_handlers"]) {
    var k = this["_handlers"][i]["indexOf"](j);
    if (k != -0x1) this["_handlers"][i]["splice"](k, 0x1);
  }
};
TDV["EventDispatcher"]["prototype"]["createNewEvent"] = function (l) {
  if (typeof Event === "function") return new Event(l);
  var m = document["createEvent"]("Event");
  m["initEvent"](l, !![], !![]);
  return m;
};
TDV["EventDispatcher"]["prototype"]["dispatchEvent"] = function (n) {
  if (n["type"] in this["_handlers"]) {
    var o = this["_handlers"][n["type"]];
    for (var p = 0x0; p < o["length"]; ++p) {
      o[p]["call"](window, n);
      if (n["defaultPrevented"]) break;
    }
  }
};
TDV["Tour"] = function (q, r) {
  TDV["EventDispatcher"]["call"](this);
  this["player"] = undefined;
  this["_settings"] = q;
  this["_devicesUrl"] = r;
  this["_playersPlayingTmp"] = [];
  this["_isInitialized"] = ![];
  this["_isPaused"] = ![];
  this["_isRemoteSession"] = ![];
  this["_orientation"] = undefined;
  this["_lockedOrientation"] = undefined;
  this["_device"] = undefined;
  this["_setupRemote"]();
};
TDV["Tour"]["DEVICE_GENERAL"] = "general";
TDV["Tour"]["DEVICE_MOBILE"] = "mobile";
TDV["Tour"]["DEVICE_IPAD"] = "ipad";
TDV["Tour"]["DEVICE_VR"] = "vr";
TDV["Tour"]["EVENT_TOUR_INITIALIZED"] = "tourInitialized";
TDV["Tour"]["EVENT_TOUR_LOADED"] = "tourLoaded";
TDV["Tour"]["EVENT_TOUR_ENDED"] = "tourEnded";
TDV["Tour"]["prototype"] = new TDV["EventDispatcher"]();
TDV["Tour"]["prototype"]["dispose"] = function () {
  if (!this["player"]) return;
  if (this["_onHashChange"]) {
    window["removeEventListener"]("hashchange", this["_onHashChange"]);
    this["_onHashChange"] = undefined;
  }
  if (this["_onKeyUp"]) {
    document["removeEventListener"]("keyup", this["_onKeyUp"]);
    this["_onKeyUp"] = undefined;
  }
  if (this["_onBeforeUnload"]) {
    window["removeEventListener"]("beforeunload", this["_onBeforeUnload"]);
    this["_onBeforeUnload"] = undefined;
  }
  var s = this["_getRootPlayer"]();
  if (s !== undefined) {
    s["stopTextToSpeech"]();
  }
  this["player"]["delete"]();
  this["player"] = undefined;
  this["_isInitialized"] = ![];
  window["currentGlobalAudios"] = undefined;
  window["pauseGlobalAudiosState"] = undefined;
  window["currentPanoramasWithCameraChanged"] = undefined;
  window["overlaysDispatched"] = undefined;
};
TDV["Tour"]["prototype"]["load"] = function () {
  if (this["player"]) return;
  var t = function (v) {
    if (v["name"] == "begin") {
      var w = v["data"]["source"]["get"]("camera");
      if (
        w &&
        w["get"]("initialSequence") &&
        w["get"]("initialSequence")["get"]("movements")["length"] > 0x0
      )
        return;
    }
    if (v["sourceClassName"] == "MediaAudio" || this["_isInitialized"]) return;
    this["_isInitialized"] = !![];
    u["unbind"]("preloadMediaShow", t, this, !![]);
    u["unbindOnObjectsOf"]("PlayListItem", "begin", t, this, !![]);
    u["unbind"]("stateChange", t, this, !![]);
    if (this["_isPaused"]) this["pause"]();
    window["parent"]["postMessage"](TDV["Tour"]["EVENT_TOUR_LOADED"], "*");
    this["dispatchEvent"](
      this["createNewEvent"](TDV["Tour"]["EVENT_TOUR_LOADED"])
    );
  };
  this["_setup"]();
  this["_settings"]["set"](
    TDV["PlayerSettings"]["SCRIPT_URL"],
    this["_currentScriptUrl"]
  );
  var u = (this["player"] = TDV["PlayerAPI"]["create"](this["_settings"]));
  u["bind"]("preloadMediaShow", t, this, !![]);
  u["bind"]("stateChange", t, this, !![]);
  u["bindOnObjectsOf"]("PlayListItem", "begin", t, this, !![]);
  u["bindOnObject"](
    "rootPlayer",
    "start",
    function (x) {
      var y = x["data"]["source"];
      y["get"]("data")["tour"] = this;
      var z =
        window["navigator"]["language"] ||
        window["navigator"]["userLanguage"] ||
        "en";
      var A = y["get"]("data")["locales"] || {};
      var B = y["get"]("data")["defaultLocale"] || z;
      var C = (this["locManager"] = new TDV["Tour"]["LocaleManager"](
        y,
        A,
        B,
        this["_settings"]["get"](
          TDV["PlayerSettings"]["QUERY_STRING_PARAMETERS"]
        )
      ));
      y["get"]("data")["localeManager"] = C;
      var D = function () {
        var O = y["get"]("data");
        if (!("updateText" in O)) {
          O["updateText"] = function (S) {
            var T = S[0x0]["split"](".");
            if (T["length"] == 0x2) {
              var U = C["trans"]["apply"](C, S);
              var V = S[0x1] || y;
              if (typeof V == "string") {
                var W = V["split"](".");
                V = y[W["shift"]()];
                for (var X = 0x0; X < W["length"] - 0x1; ++X) {
                  if (V != undefined) V = "get" in V ? V["get"](W[X]) : V[W[X]];
                }
                if (V != undefined) {
                  var Y = W[W["length"] - 0x1];
                  if (Array["isArray"](V)) {
                    for (var Z = 0x0; Z < V["length"]; ++Z) {
                      this["setValue"](V[Z], Y, U);
                    }
                  } else this["setValue"](V, Y, U);
                }
              } else {
                V = V[T[0x0]];
                this["setValue"](V, T[0x1], U);
              }
            }
          }["bind"](y);
        }
        var P = O["translateObjs"];
        var Q = O["updateText"];
        var R = function () {
          for (var a0 in P) {
            Q(P[a0]);
          }
        };
        R();
        R();
      };
      this["locManager"]["bind"](
        TDV["Tour"]["LocaleManager"]["EVENT_LOCALE_CHANGED"],
        D["bind"](this)
      );
      var E = this["_getParams"](location["search"]["substr"](0x1));
      E = y["mixObject"](
        E,
        this["_getParams"](location["hash"]["substr"](0x1))
      );
      var F = E["language"];
      if (!F || !this["locManager"]["hasLocale"](E["language"])) {
        if (y["get"]("data")["forceDefaultLocale"]) F = B;
        else F = z;
      }
      this["setLocale"](F);
      var G = y["getByClassName"]("HotspotPanoramaOverlay");
      for (var I = 0x0, J = G["length"]; I < J; ++I) {
        var K = G[I];
        var L = K["get"]("data");
        if (!L) K["set"]("data", (L = {}));
        L["defaultEnabledValue"] = K["get"]("enabled");
      }
      this["_setMediaFromURL"](E);
      this["_updateParams"](E, ![]);
      if (
        this["isMobile"]() &&
        typeof this["_devicesUrl"][this["_device"]] == "object"
      ) {
        var M = function () {
          if (
            !y["isCardboardViewMode"]() &&
            this["_getOrientation"]() != this["_orientation"]
          ) {
            this["reload"]();
            return !![];
          }
          return ![];
        };
        if (M["call"](this)) return;
        var N = y["getByClassName"]("PanoramaPlayer");
        for (var I = 0x0; I < N["length"]; ++I) {
          N[I]["bind"]("viewModeChange", M, this);
        }
        y["bind"]("orientationChange", M, this);
      }
      this["_onHashChange"] = function () {
        var a1 = this["_getParams"](location["hash"]["substr"](0x1));
        this["_setMediaFromURL"](a1, ![]);
        this["_updateParams"](a1, !![]);
      }["bind"](this);
      this["_onKeyUp"] = function (a2) {
        if (
          a2["ctrlKey"] &&
          a2["shiftKey"] &&
          a2["key"]["toLowerCase"]() == "u"
        ) {
          this["updateDeepLink"]();
          y["copyToClipboard"](location["href"]);
        }
      }["bind"](this);
      this["_onBeforeUnload"] = function (a3) {
        y["stopTextToSpeech"]();
      };
      window["addEventListener"]("hashchange", this["_onHashChange"]);
      window["addEventListener"]("beforeunload", this["_onBeforeUnload"]);
      document["addEventListener"]("keyup", this["_onKeyUp"]);
      y["bind"](
        "tourEnded",
        function () {
          this["dispatchEvent"](
            this["createNewEvent"](TDV["Tour"]["EVENT_TOUR_ENDED"])
          );
        },
        this,
        !![]
      );
      y["bind"](
        "mute_changed",
        function () {
          if (this["get"]("mute")) this["stopTextToSpeech"]();
        },
        y,
        !![]
      );
      this["dispatchEvent"](
        this["createNewEvent"](TDV["Tour"]["EVENT_TOUR_INITIALIZED"])
      );
    },
    this,
    !![]
  );
  window["addEventListener"](
    "message",
    function (a4) {
      var a5 = a4["data"];
      if (a5 == "pauseTour") a5 = "pause";
      else if (a5 == "resumeTour") a5 = "resume";
      else return;
      this[a5]["apply"](this);
    }["bind"](this)
  );
};
TDV["Tour"]["prototype"]["pause"] = function () {
  this["_isPaused"] = !![];
  if (!this["_isInitialized"]) return;
  var a6 = function (ag) {
    var ah = ag["source"];
    if (!this["_isPaused"]) ah["unbind"]("stateChange", a6, this);
    else if (ah["get"]("state") == "playing") {
      ah["pause"]();
    }
  };
  var a7 = this["player"]["getByClassName"]("PlayList");
  for (var a8 = 0x0, a9 = a7["length"]; a8 < a9; a8++) {
    var aa = a7[a8];
    var ab = aa["get"]("selectedIndex");
    if (ab != -0x1) {
      var ac = aa["get"]("items")[ab];
      var ad = ac["get"]("player");
      if (ad && ad["pause"]) {
        if (ad["get"]("state") != "playing")
          ad["bind"]("stateChange", a6, this);
        else ad["pause"]();
        this["_playersPlayingTmp"]["push"](ad);
      }
    }
  }
  var ae = this["_getRootPlayer"]();
  ae["pauseGlobalAudios"]();
  var af = ae["get"]("data");
  if (af && "quiz" in af) {
    af["quiz"]["pauseTimer"]();
  }
};
TDV["Tour"]["prototype"]["resume"] = function () {
  this["_isPaused"] = ![];
  if (!this["_isInitialized"]) return;
  while (this["_playersPlayingTmp"]["length"]) {
    var ai = this["_playersPlayingTmp"]["pop"]();
    ai["play"]();
  }
  var aj = this["_getRootPlayer"]();
  aj["resumeGlobalAudios"]();
  var ak = aj["get"]("data");
  if (ak && "quiz" in ak) {
    ak["quiz"]["continueTimer"]();
  }
};
TDV["Tour"]["prototype"]["reload"] = function () {
  this["_orientation"] = this["_getOrientation"]();
  this["updateDeepLink"]();
  this["dispose"]();
  this["load"]();
};
TDV["Tour"]["prototype"]["setMediaByIndex"] = function (al) {
  var am = this["_getRootPlayer"]();
  if (am !== undefined) {
    return am["setMainMediaByIndex"](al);
  }
};
TDV["Tour"]["prototype"]["setMediaByName"] = function (an) {
  var ao = this["_getRootPlayer"]();
  if (ao !== undefined) {
    return ao["setMainMediaByName"](an);
  }
};
TDV["Tour"]["prototype"]["triggerOverlayByName"] = function (ap, aq, ar) {
  var as = this["_getRootPlayer"]();
  if (!ar) ar = "click";
  if (as !== undefined && ar) {
    var at = as["getPanoramaOverlayByName"](ap, aq);
    if (at) {
      as["triggerOverlay"](at, ar);
    }
  }
};
TDV["Tour"]["prototype"]["focusOverlayByName"] = function (au, av) {
  var aw = this["_getRootPlayer"]();
  if (aw !== undefined) {
    var ax = aw["getPanoramaOverlayByName"](au["get"]("media"), av);
    if (ax) {
      var ay = ax["get"]("class");
      var az =
        ay == "VideoPanoramaOverlay" || ay == "QuadVideoPanoramaOverlay"
          ? ax
          : ax["get"]("items")[0x0];
      var aA, aB;
      ay = az["get"]("class");
      if (
        ay == "QuadVideoPanoramaOverlay" ||
        ay == "QuadHotspotPanoramaOverlayImage"
      ) {
        var aC = az["get"]("vertices");
        var aD = 0x0,
          aE = aC["length"];
        aA = 0x0;
        aB = 0x0;
        while (aD < aE) {
          aA += aC[aD++];
          aB += aC[aD++];
        }
        aA /= 0x4;
        aB /= 0x4;
      } else {
        aA = az["get"]("yaw");
        aB = az["get"]("pitch");
      }
      var aF = aw["getPlayListWithItem"](au);
      if (aF) {
        var aG = function () {
          aw["setPanoramaCameraWithSpot"](aF, au, aA, aB);
        };
        if (!this["_isInitialized"]) {
          var aH = function () {
            au["unbind"]("begin", aH, this);
            aG();
          };
          au["bind"]("begin", aH, this);
        } else {
          aG();
        }
      }
    }
  }
};
TDV["Tour"]["prototype"]["setComponentsVisibilityByTags"] = function (
  aI,
  aJ,
  aK
) {
  var aL = this["_getRootPlayer"]();
  if (aL !== undefined) {
    var aM = aL["getComponentsByTags"](aI, aK);
    for (var aN = 0x0, aO = aM["length"]; aN < aO; ++aN) {
      aM[aN]["set"]("visible", aJ);
    }
  }
};
TDV["Tour"]["prototype"]["setOverlaysVisibilityByTags"] = function (
  aP,
  aQ,
  aR
) {
  var aS = this["_getRootPlayer"]();
  if (aS !== undefined) {
    var aT = aS["getOverlaysByTags"](aP, aR);
    aS["setOverlaysVisibility"](aT, aQ);
  }
};
TDV["Tour"]["prototype"]["setOverlaysVisibilityByName"] = function (aU, aV) {
  var aW = this["_getRootPlayer"]();
  if (aW !== undefined) {
    var aX = aW["getActiveMediaWithViewer"](aW["getMainViewer"]());
    var aY = [];
    for (var aZ = 0x0, b0 = aU["length"]; aZ < b0; ++aZ) {
      var b1 = aW["getPanoramaOverlayByName"](aX, aU[aZ]);
      if (b1) aY["push"](b1);
    }
    aW["setOverlaysVisibility"](aY, aV);
  }
};
TDV["Tour"]["prototype"]["updateDeepLink"] = function () {
  var b2 = this["_getRootPlayer"]();
  if (b2 !== undefined) {
    b2["updateDeepLink"](!![], !![], !![]);
  }
};
TDV["Tour"]["prototype"]["setLocale"] = function (b3) {
  var b4 = this["_getRootPlayer"]();
  if (b4 !== undefined && this["locManager"] !== undefined) {
    this["locManager"]["setLocale"](b3);
  }
};
TDV["Tour"]["prototype"]["getLocale"] = function () {
  var b5 = this["_getRootPlayer"]();
  return b5 !== undefined && this["locManager"] !== undefined
    ? this["locManager"]["currentLocaleID"]
    : undefined;
};
TDV["Tour"]["prototype"]["isMobile"] = function () {
  return TDV["PlayerAPI"]["mobile"];
};
TDV["Tour"]["prototype"]["isIPad"] = function () {
  return TDV["PlayerAPI"]["device"] == TDV["PlayerAPI"]["DEVICE_IPAD"];
};
TDV["Tour"]["prototype"]["getNotchValue"] = function () {
  var b6 = document["documentElement"];
  b6["style"]["setProperty"]("--notch-top", "env(safe-area-inset-top)");
  b6["style"]["setProperty"]("--notch-right", "env(safe-area-inset-right)");
  b6["style"]["setProperty"]("--notch-bottom", "env(safe-area-inset-bottom)");
  b6["style"]["setProperty"]("--notch-left", "env(safe-area-inset-left)");
  var b7 = window["getComputedStyle"](b6);
  return (
    parseInt(b7["getPropertyValue"]("--notch-top") || "0", 0xa) ||
    parseInt(b7["getPropertyValue"]("--notch-right") || "0", 0xa) ||
    parseInt(b7["getPropertyValue"]("--notch-bottom") || "0", 0xa) ||
    parseInt(b7["getPropertyValue"]("--notch-left") || "0", 0xa)
  );
};
TDV["Tour"]["prototype"]["hasNotch"] = function () {
  return this["getNotchValue"]() > 0x0;
};
TDV["Tour"]["prototype"]["_getOrientation"] = function () {
  var b8 = this["_getRootPlayer"]();
  if (b8) {
    return b8["get"]("orientation");
  } else if (this["_lockedOrientation"]) {
    return this["_lockedOrientation"];
  } else {
    return TDV["PlayerAPI"]["getOrientation"]();
  }
};
TDV["Tour"]["prototype"]["_getParams"] = function (b9) {
  var ba = {};
  b9["split"]("&")["forEach"](function (bb) {
    var bc = bb["split"]("=")[0x0],
      bd = decodeURIComponent(bb["split"]("=")[0x1]);
    ba[bc["toLowerCase"]()] = bd;
  });
  return ba;
};
TDV["Tour"]["prototype"]["_getRootPlayer"] = function () {
  return this["player"] !== undefined
    ? this["player"]["getById"]("rootPlayer")
    : undefined;
};
TDV["Tour"]["prototype"]["_setup"] = function () {
  if (!this["_orientation"]) this["_orientation"] = this["_getOrientation"]();
  this["_device"] = this["_getDevice"]();
  this["_currentScriptUrl"] = this["_getScriptUrl"]();
  if (this["isMobile"]()) {
    var be = document["getElementById"]("metaViewport");
    if (be) {
      var bf = this["_devicesUrl"][this["_device"]];
      var bg = 0x1;
      if (
        (typeof bf == "object" &&
          this["_orientation"] in bf &&
          this["_orientation"] == TDV["PlayerAPI"]["ORIENTATION_LANDSCAPE"]) ||
        this["_device"] == TDV["Tour"]["DEVICE_GENERAL"]
      ) {
        bg = be["getAttribute"]("data-tdv-general-scale") || 0.5;
      }
      var bh = be["getAttribute"]("content");
      bh = bh["replace"](/initial-scale=(\d+(\.\d+)?)/, function (bi, bj) {
        return "initial-scale=" + bg;
      });
      be["setAttribute"]("content", bh);
    }
  }
};
TDV["Tour"]["prototype"]["_getScriptUrl"] = function () {
  var bk = this["_devicesUrl"][this["_device"]];
  if (typeof bk == "object") {
    if (this["_orientation"] in bk) {
      bk = bk[this["_orientation"]];
    }
  }
  return bk;
};
TDV["Tour"]["prototype"]["_getDevice"] = function () {
  var bl = TDV["Tour"]["DEVICE_GENERAL"];
  if (!this["_isRemoteSession"] && this["isMobile"]()) {
    if (this["isIPad"]() && TDV["Tour"]["DEVICE_IPAD"] in this["_devicesUrl"])
      bl = TDV["Tour"]["DEVICE_IPAD"];
    else if (TDV["Tour"]["DEVICE_MOBILE"] in this["_devicesUrl"])
      bl = TDV["Tour"]["DEVICE_MOBILE"];
  }
  return bl;
};
TDV["Tour"]["prototype"]["_setMediaFromURL"] = function (bm) {
  var bn = this["_getRootPlayer"]();
  var bo = bn["getActivePlayerWithViewer"](bn["getMainViewer"]());
  var bp = bo ? bn["getMediaFromPlayer"](bo) : undefined;
  var bq = undefined;
  if ("media" in bm) {
    var br = bm["media"];
    var bs = Number(br);
    bq = isNaN(bs)
      ? this["setMediaByName"](br)
      : this["setMediaByIndex"](bs - 0x1);
  } else if ("media-index" in bm) {
    bq = this["setMediaByIndex"](parseInt(bm["media-index"]) - 0x1);
  } else if ("media-name" in bm) {
    bq = this["setMediaByName"](bm["media-name"]);
  }
  if (bq == undefined) {
    bq = this["setMediaByIndex"](0x0);
  }
  if (bq != undefined) {
    var bt = bq["get"]("player");
    var bu = function () {
      if ("trigger-overlay-name" in bm) {
        this["triggerOverlayByName"](
          bq["get"]("media"),
          bm["trigger-overlay-name"],
          bm["trigger-overlay-event"]
        );
      }
      if ("focus-overlay-name" in bm) {
        this["focusOverlayByName"](bq, bm["focus-overlay-name"]);
      } else if ("yaw" in bm || "pitch" in bm) {
        var by = parseFloat(bm["yaw"]) || undefined;
        var bz = parseFloat(bm["pitch"]) || undefined;
        var bA = bn["getPlayListWithItem"](bq);
        if (bA) bn["setPanoramaCameraWithSpot"](bA, bq, by, bz);
      }
    }["bind"](this);
    if (bt) {
      var bv = bt["get"]("viewerArea") == bn["getMainViewer"]();
      var bw = bn["getMediaFromPlayer"](bt);
      if (
        (bv && bp == bq["get"]("media")) ||
        (!bv && bw == bq["get"]("media"))
      ) {
        bu();
        return bq != undefined;
      }
    }
    var bx = function () {
      bq["unbind"]("begin", bx, this);
      bu();
    };
    bq["bind"]("begin", bx, bn);
  }
  return bq != undefined;
};
TDV["Tour"]["prototype"]["_setupRemote"] = function () {
  if (this["isMobile"]() && TDV["Remote"] != undefined) {
    var bB = function () {
      var bC = undefined;
      var bD = function () {
        var bG = this["_getRootPlayer"]();
        bC = bG["get"]("lockedOrientation");
        bG["set"]("lockedOrientation", this["_lockedOrientation"]);
      }["bind"](this);
      this["_isRemoteSession"] = !![];
      this["_lockedOrientation"] = TDV["PlayerAPI"]["ORIENTATION_LANDSCAPE"];
      if (this["_device"] != TDV["Tour"]["DEVICE_GENERAL"]) {
        var bE = function () {
          bD();
          this["unbind"](TDV["Tour"]["EVENT_TOUR_INITIALIZED"], bE);
        }["bind"](this);
        this["bind"](TDV["Tour"]["EVENT_TOUR_INITIALIZED"], bE);
        this["reload"]();
      } else {
        bD();
      }
      var bF = function () {
        this["_isRemoteSession"] = ![];
        this["_getRootPlayer"]()["set"]("lockedOrientation", bC);
        TDV["Remote"]["unbind"](TDV["Remote"]["EVENT_CALL_END"], bF);
        var bH = this["_getScriptUrl"]();
        if (this["_currentScriptUrl"] != bH) this["reload"]();
      }["bind"](this);
      TDV["Remote"]["bind"](TDV["Remote"]["EVENT_CALL_END"], bF);
    }["bind"](this);
    TDV["Remote"]["bind"](TDV["Remote"]["EVENT_CALL_BEGIN"], bB);
  }
};
TDV["Tour"]["prototype"]["_updateParams"] = function (bI, bJ) {
  if (bJ && "language" in bI) {
    var bK = bI["language"];
    if (this["locManager"]["hasLocale"](bK)) {
      this["setLocale"](bK);
    }
  }
  var bL = function (bM, bN, bO) {
    var bP = bN["split"](",");
    for (var bQ = 0x0, bR = bP["length"]; bQ < bR; ++bQ) {
      bM["call"](this, bP[bQ]["split"]("+"), bO, "and");
    }
  };
  if ("hide-components-tags" in bI || "hct" in bI)
    bL["call"](
      this,
      this["setComponentsVisibilityByTags"],
      bI["hide-components-tags"] || bI["hct"],
      ![]
    );
  if ("show-components-tags" in bI || "sct" in bI)
    bL["call"](
      this,
      this["setComponentsVisibilityByTags"],
      bI["show-components-tags"] || bI["sct"],
      !![]
    );
  if ("hide-overlays-tags" in bI || "hot" in bI)
    bL["call"](
      this,
      this["setOverlaysVisibilityByTags"],
      bI["hide-overlays-tags"] || bI["hot"],
      ![]
    );
  if ("show-overlays-tags" in bI || "sot" in bI)
    bL["call"](
      this,
      this["setOverlaysVisibilityByTags"],
      bI["show-overlays-tags"] || bI["sot"],
      !![]
    );
  if ("hide-overlays-names" in bI || "hon" in bI)
    this["setOverlaysVisibilityByName"](
      decodeURIComponent(bI["hide-overlays-names"] || bI["hon"])["split"](","),
      ![]
    );
  if ("show-overlays-names" in bI || "son" in bI)
    this["setOverlaysVisibilityByName"](
      decodeURIComponent(bI["show-overlays-names"] || bI["son"])["split"](","),
      !![]
    );
};
TDV["Tour"]["LocaleManager"] = function (bS, bT, bU, bV) {
  TDV["EventDispatcher"]["call"](this);
  this["rootPlayer"] = bS;
  this["locales"] = {};
  this["defaultLocale"] = bU;
  this["queryParam"] = bV;
  this["currentLocaleMap"] = {};
  this["currentLocaleID"] = undefined;
  for (var bW in bT) {
    this["registerLocale"](bW, bT[bW]);
  }
};
TDV["Tour"]["LocaleManager"]["EVENT_LOCALE_CHANGED"] = "localeChanged";
TDV["Tour"]["LocaleManager"]["prototype"] = new TDV["EventDispatcher"]();
TDV["Tour"]["LocaleManager"]["prototype"]["registerLocale"] = function (
  bX,
  bY
) {
  var bZ = [bX, bX["split"]("-")[0x0]];
  for (var c0 = 0x0; c0 < bZ["length"]; ++c0) {
    bX = bZ[c0];
    if (!(bX in this["locales"])) {
      this["locales"][bX] = bY;
    }
  }
};
TDV["Tour"]["LocaleManager"]["prototype"]["unregisterLocale"] = function (c1) {
  delete this["locales"][c1];
  if (c1 == this["currentLocaleID"]) {
    this["setLocale"](this["defaultLocale"]);
  }
};
TDV["Tour"]["LocaleManager"]["prototype"]["hasLocale"] = function (c2) {
  return c2 in this["locales"];
};
TDV["Tour"]["LocaleManager"]["prototype"]["setLocale"] = function (c3) {
  var c4 = undefined;
  var c5 = c3["split"]("-")[0x0];
  var c6 = [c3, c5];
  for (var c7 = 0x0; c7 < c6["length"]; ++c7) {
    var c9 = c6[c7];
    if (c9 in this["locales"]) {
      c4 = c9;
      break;
    }
  }
  if (c4 === undefined) {
    for (var c9 in this["locales"]) {
      if (c9["indexOf"](c5) == 0x0) {
        c4 = c9;
        break;
      }
    }
  }
  if (c4 === undefined) {
    c4 = this["defaultLocale"];
  }
  var ca = this["locales"][c4];
  if (ca !== undefined && this["currentLocaleID"] != c4) {
    this["currentLocaleID"] = c4;
    var cb = this;
    if (typeof ca == "string") {
      var cc = new XMLHttpRequest();
      cc["onreadystatechange"] = function () {
        if (cc["readyState"] == 0x4) {
          if (cc["status"] == 0xc8) {
            cb["locales"][c4] = cb["currentLocaleMap"] = cb[
              "_parsePropertiesContent"
            ](cc["responseText"]);
            cb["dispatchEvent"](
              cb["createNewEvent"](
                TDV["Tour"]["LocaleManager"]["EVENT_LOCALE_CHANGED"]
              )
            );
          } else {
            throw ca + "\x20can\x27t\x20be\x20loaded";
          }
        }
      };
      var cd = ca;
      if (this["queryParam"])
        cd += (cd["indexOf"]("?") == -0x1 ? "?" : "&") + this["queryParam"];
      cc["open"]("GET", cd);
      cc["send"]();
    } else {
      this["currentLocaleMap"] = ca;
      this["dispatchEvent"](
        this["createNewEvent"](
          TDV["Tour"]["LocaleManager"]["EVENT_LOCALE_CHANGED"]
        )
      );
    }
  }
};
TDV["Tour"]["LocaleManager"]["prototype"]["trans"] = function (ce) {
  var cf = this["currentLocaleMap"][ce];
  if (cf && arguments["length"] > 0x2) {
    var cg = typeof arguments[0x2] == "object" ? arguments[0x2] : undefined;
    var ch = arguments;
    function ci(cj) {
      return /^\d+$/["test"](cj);
    }
    cf = cf["replace"](
      /\{\{([\w\.]+)\}\}/g,
      function (ck, cl) {
        if (ci(cl)) cl = ch[parseInt(cl) + 0x1];
        else if (cg !== undefined) cl = cg[cl];
        if (typeof cl == "string") cl = this["currentLocaleMap"][cl] || cl;
        else if (typeof cl == "function") cl = cl["call"](this["rootPlayer"]);
        return cl !== undefined ? cl : "";
      }["bind"](this)
    );
  }
  return cf;
};
TDV["Tour"]["LocaleManager"]["prototype"]["_parsePropertiesContent"] =
  function (cm) {
    cm = cm["replace"](/(^|\n)#[^\n]*/g, "");
    var cn = {};
    var co = cm["split"]("\x0a");
    for (var cp = 0x0, cq = co["length"]; cp < cq; ++cp) {
      var cr = co[cp]["trim"]();
      if (cr["length"] == 0x0) {
        continue;
      }
      var cs = cr["indexOf"]("=");
      if (cs == -0x1) {
        console["error"]("Locale\x20parser:\x20Invalid\x20line\x20" + cp);
        continue;
      }
      var ct = cr["substr"](0x0, cs)["trim"]();
      var cu = cr["substr"](cs + 0x1)["trim"]();
      var cv;
      while (
        (cv = cu["lastIndexOf"]("\x5c")) != -0x1 &&
        cv == cu["length"] - 0x1 &&
        ++cp < cq
      ) {
        cu = cu["substr"](0x0, cu["length"] - 0x2);
        cr = co[cp];
        if (cr["length"] == 0x0) break;
        cu += "\x0a" + cr;
        cu = cu["trim"]();
      }
      cn[ct] = cu;
    }
    return cn;
  };
TDV["Tour"]["HistoryData"] = function (cw) {
  this["playList"] = cw;
  this["list"] = [];
  this["pointer"] = -0x1;
};
TDV["Tour"]["HistoryData"]["prototype"]["add"] = function (cx) {
  if (
    this["pointer"] < this["list"]["length"] &&
    this["list"][this["pointer"]] == cx
  ) {
    return;
  }
  ++this["pointer"];
  this["list"]["splice"](
    this["pointer"],
    this["list"]["length"] - this["pointer"],
    cx
  );
};
TDV["Tour"]["HistoryData"]["prototype"]["back"] = function () {
  if (!this["canBack"]()) return;
  this["playList"]["set"]("selectedIndex", this["list"][--this["pointer"]]);
};
TDV["Tour"]["HistoryData"]["prototype"]["forward"] = function () {
  if (!this["canForward"]()) return;
  this["playList"]["set"]("selectedIndex", this["list"][++this["pointer"]]);
};
TDV["Tour"]["HistoryData"]["prototype"]["canBack"] = function () {
  return this["pointer"] > 0x0;
};
TDV["Tour"]["HistoryData"]["prototype"]["canForward"] = function () {
  return (
    this["pointer"] >= 0x0 && this["pointer"] < this["list"]["length"] - 0x1
  );
};
TDV["Tour"]["Script"] = function () {};
TDV["Tour"]["Script"]["assignObjRecursively"] = function (cy, cz) {
  for (var cA in cy) {
    var cB = cy[cA];
    if (typeof cB == "object" && cB !== null)
      this["assignObjRecursively"](cy[cA], cz[cA] || (cz[cA] = {}));
    else cz[cA] = cB;
  }
  return cz;
};
TDV["Tour"]["Script"]["autotriggerAtStart"] = function (cC, cD, cE) {
  var cF = function (cG) {
    cD();
    if (cE == !![]) cC["unbind"]("change", cF, this);
  };
  cC["bind"]("change", cF, this);
};
TDV["Tour"]["Script"]["changeBackgroundWhilePlay"] = function (cH, cI, cJ) {
  var cK = function () {
    cL["unbind"]("stop", cK, this);
    if (
      cJ == cN["get"]("backgroundColor") &&
      cQ == cN["get"]("backgroundColorRatios")
    ) {
      cN["set"]("backgroundColor", cO);
      cN["set"]("backgroundColorRatios", cP);
    }
  };
  var cL = cH["get"]("items")[cI];
  var cM = cL["get"]("player");
  var cN = cM["get"]("viewerArea");
  var cO = cN["get"]("backgroundColor");
  var cP = cN["get"]("backgroundColorRatios");
  var cQ = [0x0];
  if (cJ != cO || cQ != cP) {
    cN["set"]("backgroundColor", cJ);
    cN["set"]("backgroundColorRatios", cQ);
    cL["bind"]("stop", cK, this);
  }
};
TDV["Tour"]["Script"]["changeOpacityWhilePlay"] = function (cR, cS, cT) {
  var cU = function () {
    cV["unbind"]("stop", cU, this);
    if (cY == cX["get"]("backgroundOpacity")) {
      cX["set"]("opacity", cY);
    }
  };
  var cV = cR["get"]("items")[cS];
  var cW = cV["get"]("player");
  var cX = cW["get"]("viewerArea");
  var cY = cX["get"]("backgroundOpacity");
  if (cT != cY) {
    cX["set"]("backgroundOpacity", cT);
    cV["bind"]("stop", cU, this);
  }
};
TDV["Tour"]["Script"]["changePlayListWithSameSpot"] = function (cZ, d0) {
  var d1 = cZ["get"]("selectedIndex");
  if (d1 >= 0x0 && d0 >= 0x0 && d1 != d0) {
    var d2 = cZ["get"]("items")[d1];
    var d3 = cZ["get"]("items")[d0];
    var d4 = d2["get"]("player");
    var d5 = d3["get"]("player");
    if (
      (d4["get"]("class") == "PanoramaPlayer" ||
        d4["get"]("class") == "Video360Player") &&
      (d5["get"]("class") == "PanoramaPlayer" ||
        d5["get"]("class") == "Video360Player")
    ) {
      var d6 = this["cloneCamera"](d3["get"]("camera"));
      this["setCameraSameSpotAsMedia"](d6, d2["get"]("media"));
      this["startPanoramaWithCamera"](d3["get"]("media"), d6);
    }
  }
};
TDV["Tour"]["Script"]["clone"] = function (d7, d8) {
  var d9 = this["rootPlayer"]["createInstance"](d7["get"]("class"));
  var da = d7["get"]("id");
  if (da) {
    var db =
      da + "_" + Math["random"]()["toString"](0x24)["substring"](0x2, 0xf);
    d9["set"]("id", db);
    this[db] = d9;
  }
  for (var dc = 0x0; dc < d8["length"]; ++dc) {
    var dd = d8[dc];
    var de = d7["get"](dd);
    if (de) d9["set"](dd, de);
  }
  return d9;
};
TDV["Tour"]["Script"]["cloneCamera"] = function (df) {
  var dg = this["clone"](df, [
    "manualRotationSpeed",
    "manualZoomSpeed",
    "automaticRotationSpeed",
    "automaticZoomSpeed",
    "timeToIdle",
    "sequences",
    "draggingFactor",
    "hoverFactor",
  ]);
  var dh = ["initialSequence", "idleSequence"];
  for (var di = 0x0; di < dh["length"]; ++di) {
    var dj = dh[di];
    var dk = df["get"](dj);
    if (dk) {
      var dl = this["clone"](dk, [
        "mandatory",
        "repeat",
        "restartMovementOnUserInteraction",
        "restartMovementDelay",
      ]);
      dg["set"](dj, dl);
      var dm = dk["get"]("movements");
      var dn = [];
      var dp = [
        "easing",
        "duration",
        "hfovSpeed",
        "pitchSpeed",
        "yawSpeed",
        "path",
        "stereographicFactorSpeed",
        "targetYaw",
        "targetPitch",
        "targetHfov",
        "targetStereographicFactor",
        "hfovDelta",
        "pitchDelta",
        "yawDelta",
      ];
      for (var dq = 0x0; dq < dm["length"]; ++dq) {
        var dr = dm[dq];
        var ds = this["clone"](dr, dp);
        var dt = dr["getBindings"]("end");
        if (dt["length"] > 0x0) {
          for (var du = 0x0; du < dt["length"]; ++du) {
            var dv = dt[du];
            if (typeof dv == "string") {
              dv = dv["replace"](df["get"]("id"), dg["get"]("id"));
              dv = new Function("event", dv);
              ds["bind"]("end", dv, this);
            }
          }
        }
        dn["push"](ds);
      }
      dl["set"]("movements", dn);
    }
  }
  return dg;
};
TDV["Tour"]["Script"]["copyObjRecursively"] = function (dw) {
  var dx = {};
  for (var dy in dw) {
    var dz = dw[dy];
    if (typeof dz == "object" && dz !== null)
      dx[dy] = this["copyObjRecursively"](dw[dy]);
    else dx[dy] = dz;
  }
  return dx;
};
TDV["Tour"]["Script"]["copyToClipboard"] = function (dA) {
  if (navigator["clipboard"]) {
    navigator["clipboard"]["writeText"](dA);
  } else {
    var dB = document["createElement"]("textarea");
    dB["value"] = dA;
    dB["style"]["position"] = "fixed";
    document["body"]["appendChild"](dB);
    dB["focus"]();
    dB["select"]();
    try {
      document["execCommand"]("copy");
    } catch (dC) {}
    document["body"]["removeChild"](dB);
  }
};
TDV["Tour"]["Script"]["executeFunctionWhenChange"] = function (dD, dE, dF, dG) {
  var dH = undefined;
  var dI = function (dL) {
    if (dL["data"]["previousSelectedIndex"] == dE) {
      if (dG) dG["call"](this);
      if (dF && dH) dH["unbind"]("end", dF, this);
      dD["unbind"]("change", dI, this);
    }
  };
  if (dF) {
    var dJ = dD["get"]("items")[dE];
    if (dJ["get"]("class") == "PanoramaPlayListItem") {
      var dK = dJ["get"]("camera");
      if (dK != undefined) dH = dK["get"]("initialSequence");
      if (dH == undefined) dH = dK["get"]("idleSequence");
    } else {
      dH = dJ["get"]("media");
    }
    if (dH) {
      dH["bind"]("end", dF, this);
    }
  }
  dD["bind"]("change", dI, this);
};
TDV["Tour"]["Script"]["fixTogglePlayPauseButton"] = function (dM) {
  var dN = dM["get"]("buttonPlayPause");
  if (typeof dN !== "undefined" && dM["get"]("state") == "playing") {
    if (!Array["isArray"](dN)) dN = [dN];
    for (var dO = 0x0; dO < dN["length"]; ++dO) dN[dO]["set"]("pressed", !![]);
  }
};
TDV["Tour"]["Script"]["getActiveMediaWithViewer"] = function (dP) {
  var dQ = this["getActivePlayerWithViewer"](dP);
  if (dQ == undefined) {
    return undefined;
  }
  return this["getMediaFromPlayer"](dQ);
};
TDV["Tour"]["Script"]["getActivePlayerWithViewer"] = function (dR) {
  var dS = this["getCurrentPlayers"]();
  var dT = dS["length"];
  while (dT-- > 0x0) {
    var dU = dS[dT];
    if (dU["get"]("viewerArea") == dR) {
      var dV = dU["get"]("class");
      if (
        dV == "PanoramaPlayer" &&
        (dU["get"]("panorama") != undefined || dU["get"]("video") != undefined)
      )
        return dU;
      else if (
        (dV == "VideoPlayer" || dV == "Video360Player") &&
        dU["get"]("video") != undefined
      )
        return dU;
      else if (dV == "PhotoAlbumPlayer" && dU["get"]("photoAlbum") != undefined)
        return dU;
      else if (dV == "MapPlayer" && dU["get"]("map") != undefined) return dU;
    }
  }
  return undefined;
};
TDV["Tour"]["Script"]["getCurrentPlayerWithMedia"] = function (dW) {
  var dX = undefined;
  var dY = undefined;
  switch (dW["get"]("class")) {
    case "Panorama":
    case "LivePanorama":
    case "HDRPanorama":
      dX = "PanoramaPlayer";
      dY = "panorama";
      break;
    case "Video360":
      dX = "PanoramaPlayer";
      dY = "video";
      break;
    case "PhotoAlbum":
      dX = "PhotoAlbumPlayer";
      dY = "photoAlbum";
      break;
    case "Map":
      dX = "MapPlayer";
      dY = "map";
      break;
    case "Video":
      dX = "VideoPlayer";
      dY = "video";
      break;
  }
  if (dX != undefined) {
    var dZ = this["getByClassName"](dX);
    for (var e0 = 0x0; e0 < dZ["length"]; ++e0) {
      var e1 = dZ[e0];
      if (e1["get"](dY) == dW) {
        return e1;
      }
    }
  } else {
    return undefined;
  }
};
TDV["Tour"]["Script"]["getCurrentPlayers"] = function () {
  var e2 = this["getByClassName"]("PanoramaPlayer");
  e2 = e2["concat"](this["getByClassName"]("VideoPlayer"));
  e2 = e2["concat"](this["getByClassName"]("Video360Player"));
  e2 = e2["concat"](this["getByClassName"]("PhotoAlbumPlayer"));
  e2 = e2["concat"](this["getByClassName"]("MapPlayer"));
  return e2;
};
TDV["Tour"]["Script"]["getGlobalAudio"] = function (e3) {
  var e4 = window["currentGlobalAudios"];
  if (e4 != undefined && e3["get"]("id") in e4) {
    e3 = e4[e3["get"]("id")]["audio"];
  }
  return e3;
};
TDV["Tour"]["Script"]["getMediaByName"] = function (e5) {
  var e6 = this["getByClassName"]("Media");
  for (var e7 = 0x0, e8 = e6["length"]; e7 < e8; ++e7) {
    var e9 = e6[e7];
    var ea = e9["get"]("data");
    if (ea && ea["label"] == e5) {
      return e9;
    }
  }
  return undefined;
};
TDV["Tour"]["Script"]["getMediaByTags"] = function (eb, ec) {
  return this["_getObjectsByTags"](eb, ["Media"], "tags2Media", ec);
};
TDV["Tour"]["Script"]["getOverlaysByTags"] = function (ed, ee) {
  return this["_getObjectsByTags"](
    ed,
    [
      "HotspotPanoramaOverlay",
      "HotspotMapOverlay",
      "VideoPanoramaOverlay",
      "QuadVideoPanoramaOverlay",
    ],
    "tags2Overlays",
    ee
  );
};
TDV["Tour"]["Script"]["getOverlaysByGroupname"] = function (ef) {
  var eg = this["get"]("data");
  var eh = "groupname2Overlays";
  var ei = eg[eh];
  if (!ei) {
    var ej = ["HotspotPanoramaOverlay", "VideoPanoramaOverlay"];
    eg[eh] = ei = {};
    for (var ek = 0x0; ek < ej["length"]; ++ek) {
      var el = ej[ek];
      var em = this["getByClassName"](el);
      for (var en = 0x0, eo = em["length"]; en < eo; ++en) {
        var ep = em[en];
        var eq = ep["get"]("data");
        if (eq && eq["group"]) {
          var er = ei[eq["group"]];
          if (!er) ei[eq["group"]] = er = [];
          er["push"](ep);
        }
      }
    }
  }
  return ei[ef] || [];
};
TDV["Tour"]["Script"]["getComponentsByTags"] = function (es, et) {
  return this["_getObjectsByTags"](es, ["UIComponent"], "tags2Components", et);
};
TDV["Tour"]["Script"]["_getObjectsByTags"] = function (eu, ev, ew, ex) {
  var ey = this["get"]("data");
  var ez = ey[ew];
  if (!ez) {
    ey[ew] = ez = {};
    for (var eA = 0x0; eA < ev["length"]; ++eA) {
      var eB = ev[eA];
      var eC = this["getByClassName"](eB);
      for (var eE = 0x0, eG = eC["length"]; eE < eG; ++eE) {
        var eI = eC[eE];
        var eJ = eI["get"]("data");
        if (eJ && eJ["tags"]) {
          var eK = eJ["tags"];
          for (var eN = 0x0, eO = eK["length"]; eN < eO; ++eN) {
            var eP = eK[eN];
            if (eP in ez) ez[eP]["push"](eI);
            else ez[eP] = [eI];
          }
        }
      }
    }
  }
  var eQ = undefined;
  ex = ex || "and";
  for (var eE = 0x0, eG = eu["length"]; eE < eG; ++eE) {
    var eR = ez[eu[eE]];
    if (!eR) continue;
    if (!eQ) eQ = eR["concat"]();
    else {
      if (ex == "and") {
        for (var eN = eQ["length"] - 0x1; eN >= 0x0; --eN) {
          if (eR["indexOf"](eQ[eN]) == -0x1) eQ["splice"](eN, 0x1);
        }
      } else if (ex == "or") {
        for (var eN = eR["length"] - 0x1; eN >= 0x0; --eN) {
          var eI = eR[eN];
          if (eQ["indexOf"](eI) == -0x1) eQ["push"](eI);
        }
      }
    }
  }
  return eQ || [];
};
TDV["Tour"]["Script"]["getComponentByName"] = function (eS) {
  var eT = this["getByClassName"]("UIComponent");
  for (var eU = 0x0, eV = eT["length"]; eU < eV; ++eU) {
    var eW = eT[eU];
    var eX = eW["get"]("data");
    if (eX != undefined && eX["name"] == eS) {
      return eW;
    }
  }
  return undefined;
};
TDV["Tour"]["Script"]["getMainViewer"] = function () {
  var eY = "MainViewer";
  return this[eY] || this[eY + "_mobile"];
};
TDV["Tour"]["Script"]["getMediaFromPlayer"] = function (eZ) {
  switch (eZ["get"]("class")) {
    case "PanoramaPlayer":
      return eZ["get"]("panorama") || eZ["get"]("video");
    case "VideoPlayer":
    case "Video360Player":
      return eZ["get"]("video");
    case "PhotoAlbumPlayer":
      return eZ["get"]("photoAlbum");
    case "MapPlayer":
      return eZ["get"]("map");
  }
};
TDV["Tour"]["Script"]["getMediaWidth"] = function (f0) {
  switch (f0["get"]("class")) {
    case "Video360":
      var f1 = f0["get"]("video");
      if (f1 instanceof Array) {
        var f2 = 0x0;
        for (var f3 = 0x0; f3 < f1["length"]; f3++) {
          var f4 = f1[f3];
          if (f4["get"]("width") > f2) f2 = f4["get"]("width");
        }
        return f2;
      } else {
        return f4["get"]("width");
      }
    default:
      return f0["get"]("width");
  }
};
TDV["Tour"]["Script"]["getMediaHeight"] = function (f5) {
  switch (f5["get"]("class")) {
    case "Video360":
      var f6 = f5["get"]("video");
      if (f6 instanceof Array) {
        var f7 = 0x0;
        for (var f8 = 0x0; f8 < f6["length"]; f8++) {
          var f9 = f6[f8];
          if (f9["get"]("height") > f7) f7 = f9["get"]("height");
        }
        return f7;
      } else {
        return f9["get"]("height");
      }
    default:
      return f5["get"]("height");
  }
};
TDV["Tour"]["Script"]["getOverlays"] = function (fa) {
  switch (fa["get"]("class")) {
    case "LivePanorama":
    case "HDRPanorama":
    case "Panorama":
      var fb = fa["get"]("overlays")["concat"]() || [];
      var fc = fa["get"]("frames");
      for (var fd = 0x0; fd < fc["length"]; ++fd) {
        fb = fb["concat"](fc[fd]["get"]("overlays") || []);
      }
      return fb;
    case "Video360":
    case "Map":
      return fa["get"]("overlays") || [];
    default:
      return [];
  }
};
TDV["Tour"]["Script"]["getPanoramaOverlayByName"] = function (fe, ff) {
  var fg = this["getOverlays"](fe);
  for (var fh = 0x0, fi = fg["length"]; fh < fi; ++fh) {
    var fj = fg[fh];
    var fk = fj["get"]("data");
    if (fk != undefined && fk["label"] == ff) {
      return fj;
    }
  }
  return undefined;
};
TDV["Tour"]["Script"]["getPanoramaOverlaysByTags"] = function (fl, fm, fn) {
  var fo = [];
  var fp = this["getOverlays"](fl);
  var fq = this["getOverlaysByTags"](fm, fn);
  for (var fr = 0x0, fs = fp["length"]; fr < fs; ++fr) {
    var ft = fp[fr];
    if (fq["indexOf"](ft) != -0x1) fo["push"](ft);
  }
  return fo;
};
TDV["Tour"]["Script"]["getPixels"] = function (fu) {
  var fv = /((\+|-)?d+(.d*)?)(px|vw|vh|vmin|vmax)?/i["exec"](fu);
  if (fv == undefined) {
    return 0x0;
  }
  var fw = parseFloat(fv[0x1]);
  var fx = fv[0x4];
  var fy = this["rootPlayer"]["get"]("actualWidth") / 0x64;
  var fz = this["rootPlayer"]["get"]("actualHeight") / 0x64;
  switch (fx) {
    case "vw":
      return fw * fy;
    case "vh":
      return fw * fz;
    case "vmin":
      return fw * Math["min"](fy, fz);
    case "vmax":
      return fw * Math["max"](fy, fz);
    default:
      return fw;
  }
};
TDV["Tour"]["Script"]["getPlayListsWithMedia"] = function (fA, fB) {
  var fC = [];
  var fD = this["getByClassName"]("PlayList");
  for (var fE = 0x0, fF = fD["length"]; fE < fF; ++fE) {
    var fG = fD[fE];
    if (fB && fG["get"]("selectedIndex") == -0x1) continue;
    var fH = this["getPlayListItemByMedia"](fG, fA);
    if (fH != undefined && fH["get"]("player") != undefined) fC["push"](fG);
  }
  return fC;
};
TDV["Tour"]["Script"]["_getPlayListsWithViewer"] = function (fI) {
  var fJ = this["getByClassName"]("PlayList");
  var fK = function (fM) {
    var fN = fM["get"]("items");
    for (var fO = fN["length"] - 0x1; fO >= 0x0; --fO) {
      var fP = fN[fO];
      var fQ = fP["get"]("player");
      if (fQ !== undefined && fQ["get"]("viewerArea") == fI) return !![];
    }
    return ![];
  };
  for (var fL = fJ["length"] - 0x1; fL >= 0x0; --fL) {
    if (!fK(fJ[fL])) fJ["splice"](fL, 0x1);
  }
  return fJ;
};
TDV["Tour"]["Script"]["getPlayListWithItem"] = function (fR) {
  var fS = this["getByClassName"]("PlayList");
  for (var fT = fS["length"] - 0x1; fT >= 0x0; --fT) {
    var fU = fS[fT];
    var fV = fU["get"]("items");
    for (var fW = fV["length"] - 0x1; fW >= 0x0; --fW) {
      var fX = fV[fW];
      if (fX == fR) return fU;
    }
  }
  return undefined;
};
TDV["Tour"]["Script"]["getFirstPlayListWithMedia"] = function (fY, fZ) {
  var g0 = this["getPlayListsWithMedia"](fY, fZ);
  return g0["length"] > 0x0 ? g0[0x0] : undefined;
};
TDV["Tour"]["Script"]["getPlayListItemByMedia"] = function (g1, g2) {
  var g3 = g1["get"]("items");
  for (var g4 = 0x0, g5 = g3["length"]; g4 < g5; ++g4) {
    var g6 = g3[g4];
    if (g6["get"]("media") == g2) return g6;
  }
  return undefined;
};
TDV["Tour"]["Script"]["getPlayListItems"] = function (g7, g8) {
  var g9 = (function () {
    switch (g7["get"]("class")) {
      case "Panorama":
      case "LivePanorama":
      case "HDRPanorama":
        return "PanoramaPlayListItem";
      case "Video360":
        return "Video360PlayListItem";
      case "PhotoAlbum":
        return "PhotoAlbumPlayListItem";
      case "Map":
        return "MapPlayListItem";
      case "Video":
        return "VideoPlayListItem";
    }
  })();
  if (g9 != undefined) {
    var gb = this["getByClassName"](g9);
    for (var gc = gb["length"] - 0x1; gc >= 0x0; --gc) {
      var gd = gb[gc];
      if (
        gd["get"]("media") != g7 ||
        (g8 != undefined && gd["get"]("player") != g8)
      ) {
        gb["splice"](gc, 0x1);
      }
    }
    return gb;
  } else {
    return [];
  }
};
TDV["Tour"]["Script"]["historyGoBack"] = function (ge) {
  var gf = this["get"]("data")["history"][ge["get"]("id")];
  if (gf != undefined) {
    gf["back"]();
  }
};
TDV["Tour"]["Script"]["historyGoForward"] = function (gg) {
  var gh = this["get"]("data")["history"][gg["get"]("id")];
  if (gh != undefined) {
    gh["forward"]();
  }
};
TDV["Tour"]["Script"]["init"] = function () {
  var gi = this["get"]("data")["history"];
  var gj = function (gs) {
    var gt = gs["source"];
    var gu = gt["get"]("selectedIndex");
    if (gu < 0x0) return;
    var gv = gt["get"]("id");
    if (!gi["hasOwnProperty"](gv)) gi[gv] = new TDV["Tour"]["HistoryData"](gt);
    gi[gv]["add"](gu);
  };
  var gk = this["getByClassName"]("PlayList");
  for (var gm = 0x0, gn = gk["length"]; gm < gn; ++gm) {
    var go = gk[gm];
    go["bind"]("change", gj, this);
  }
  if (this["getMainViewer"]()["get"]("translationTransitionEnabled")) {
    var gp = this["getByClassName"]("ThumbnailList");
    gp = gp["concat"](this["getByClassName"]("ThumbnailGrid"));
    gp = gp["concat"](this["getByClassName"]("DropDown"));
    function gw(gx) {
      var gy = gx["source"]["get"]("playList");
      var gz = gy["get"]("selectedIndex");
      if (gz >= 0x0) {
        this["skip3DTransitionOnce"](gy["get"]("items")[gz]["get"]("player"));
      }
    }
    for (var gm = 0x0, gq = gp["length"]; gm < gq; ++gm) {
      var gr = gp[gm];
      gr["bind"]("change", gw, this);
    }
  }
};
TDV["Tour"]["Script"]["sendAnalyticsData"] = function (gA, gB, gC) {
  if (window["dataLayer"]) {
    window["dataLayer"]["push"]({ event: gB, label: gC, category: gA });
  }
  if (!this["get"]("data")["tour"]["player"]["cookiesEnabled"]) return;
  if (window["ga"]) {
    window["ga"]("send", "event", gA, gB, gC);
  }
  if (window["gtag"]) {
    window["gtag"]("event", gB, { category: gA, label: gC });
  }
};
TDV["Tour"]["Script"]["initAnalytics"] = function () {
  var gE = this["getByClassName"]("Panorama");
  gE = gE["concat"](this["getByClassName"]("Video360"));
  gE = gE["concat"](this["getByClassName"]("Map"));
  for (var gH = 0x0, gK = gE["length"]; gH < gK; ++gH) {
    var gL = gE[gH];
    var gN = gL["get"]("data");
    var gO = gN ? gN["label"] : "";
    var gP = this["getOverlays"](gL);
    for (var gQ = 0x0, gR = gP["length"]; gQ < gR; ++gQ) {
      var gS = gP[gQ];
      var gT =
        gS["get"]("data") != undefined
          ? gO + "\x20-\x20" + gS["get"]("data")["label"]
          : gO;
      switch (gS["get"]("class")) {
        case "FlatHotspotPanoramaOverlay":
        case "HotspotPanoramaOverlay":
        case "HotspotMapOverlay":
        case "AreaHotspotMapOverlay":
          var gU = gS["get"]("areas");
          for (var gV = 0x0; gV < gU["length"]; ++gV) {
            gU[gV]["bind"](
              "click",
              this["sendAnalyticsData"]["bind"](this, "Hotspot", "click", gT),
              this,
              ![]
            );
          }
          break;
        case "CeilingCapPanoramaOverlay":
        case "TripodCapPanoramaOverlay":
          gS["bind"](
            "click",
            this["sendAnalyticsData"]["bind"](this, "Cap", "click", gT),
            this,
            ![]
          );
          break;
        case "QuadVideoPanoramaOverlay":
        case "VideoPanoramaOverlay":
          gS["bind"](
            "click",
            this["sendAnalyticsData"]["bind"](this, "Hotspot", "click", gT),
            this,
            ![]
          );
          gS["bind"](
            "start",
            this["sendAnalyticsData"]["bind"](this, "Hotspot", "start", gT),
            this,
            ![]
          );
          break;
      }
    }
  }
  var gW = this["getByClassName"]("UIComponent");
  for (var gH = 0x0, gK = gW["length"]; gH < gK; ++gH) {
    var gX = gW[gH];
    var gY = gX["getBindings"]("click");
    if (gY["length"] > 0x0) {
      var gZ = gX["get"]("data")["name"];
      gX["bind"](
        "click",
        this["sendAnalyticsData"]["bind"](this, "Skin", "click", gZ),
        this,
        ![]
      );
    }
  }
  var h0 = this["getByClassName"]("PlayListItem");
  var h1 = {};
  for (var gH = 0x0, gK = h0["length"]; gH < gK; ++gH) {
    var h2 = h0[gH];
    var gE = h2["get"]("media");
    if (!(gE["get"]("id") in h1)) {
      var gN = gE["get"]("data");
      h2["bind"](
        "begin",
        this["sendAnalyticsData"]["bind"](
          this,
          "Media",
          "play",
          gN ? gN["label"] : undefined
        ),
        this,
        ![]
      );
      h1[gE["get"]("id")] = h2;
    }
  }
  if (TDV["Remote"] != undefined) {
    var h3 = undefined;
    TDV["Remote"]["bind"](
      TDV["Remote"]["EVENT_CALL_BEGIN"],
      function (h4) {
        h3 = Date["now"]();
        this["sendAnalyticsData"](
          "Live\x20Guided\x20Tour",
          "Start\x20Call",
          "Guest:\x20" + h4
        );
      }["bind"](this)
    );
    TDV["Remote"]["bind"](
      TDV["Remote"]["EVENT_CALL_END"],
      function (h5) {
        var h6 = new Date();
        h6["setTime"](Date["now"]() - h3);
        this["sendAnalyticsData"](
          "Live\x20Guided\x20Tour",
          "End\x20Call",
          "Guest:\x20" +
            h5 +
            "\x20Duration:\x20" +
            h6["toUTCString"]()["split"]("\x20")[0x4]
        );
      }["bind"](this)
    );
  }
};
TDV["Tour"]["Script"]["initQuiz"] = function (h7, h8, h9) {
  var ha = {
    question: {
      veil: { backgroundColor: "#000000", backgroundOpacity: 0.2 },
      window: {
        width: "60%",
        height: "60%",
        backgroundColor: "#ffffff",
        backgroundOpacity: 0.9,
        borderRadius: 0x5,
        horizontalAlign: "center",
        minWidth: 0x1f4,
        paddingBottom: 0x14,
        paddingLeft: 0x14,
        paddingRight: 0x14,
        paddingTop: 0x14,
        shadowBlurRadius: 0x4,
        shadow: !![],
        shadowColor: "#000000",
        shadowOpacity: 0.3,
        shadowHorizontalLength: 0x0,
        shadowVerticalLength: 0x0,
        shadowSpread: 0x4,
        title: {
          fontColor: "#000000",
          fontFamily: "Arial",
          fontSize: 0x14,
          fontWeight: "600",
          paddingLeft: 0x32,
          paddingRight: 0x32,
          paddingBottom: 0x28,
          paddingTop: 0x19,
          textAlign: "center",
        },
        buttonsContainer: {
          horizontalAlign: "right",
          verticalAlign: "bottom",
          button: {
            backgroundColor: "#000000",
            backgroundOpacity: 0.7,
            borderRadius: 0x3,
            fontColor: "#ffffff",
            fontFamily: "Arial",
            fontSize: 0x12,
            fontWeight: "600",
            horizontalAlign: "center",
            paddingLeft: 0x19,
            paddingRight: 0x19,
            paddingTop: 0xa,
            paddingBottom: 0xa,
            verticalAlign: "middle",
          },
        },
        bodyContainer: {
          width: "100%",
          height: "100%",
          gap: 0x23,
          layout: "horizontal",
          paddingLeft: 0x1e,
          paddingRight: 0x1e,
          paddingBottom: 0x1e,
        },
        mediaContainer: {
          width: "70%",
          height: "100%",
          buttonNext: {
            iconURL:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAlCAMAAACAj7KHAAAAA3NCSVQICAjb4U/gAAAAS1BMVEX///8AAAAAAAAAAAAAAACVlZWLi4uDg4MAAAC8vLx8fHx5eXl2dnZ0dHRxcXHDw8PAwMBra2tjY2PY2NiLi4v7+/v5+fn////7+/sWSBTRAAAAGXRSTlMAESIzRFVVVVVmZmZmZmZ3d3d3mZnu7v//nfgMagAAAAlwSFlzAAAK6wAACusBgosNWgAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDYvMjkvMTUTtAt+AAAAjElEQVQokbXTyRaAIAgFUJHmeTL7/y9Naie+Toti2T0R4suYH4qI0HNKGpGV0iYwuoLFlEzeu0YT2dqH2jtFZHN3UR9T6FamKQi3O6Q+STL2O4r6WR4QcTZfdIQjR6NzttxUaKk2Eb/qdql34HfgbPA8eAdwb3jXD/eD7xTnAGcH5g1n9CHXBv8Ln9UJhXMPrAhUbYMAAAAASUVORK5CYII=",
            width: 0x19,
            height: 0x25,
          },
          buttonPrevious: {
            iconURL:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAlCAMAAACAj7KHAAAAA3NCSVQICAjb4U/gAAAAS1BMVEX///8AAAAAAAAAAAAAAACVlZWLi4uDg4MAAAC8vLx8fHx5eXl2dnZ0dHRxcXHDw8PAwMBra2tjY2PY2NiLi4v7+/v5+fn////7+/sWSBTRAAAAGXRSTlMAESIzRFVVVVVmZmZmZmZ3d3d3mZnu7v//nfgMagAAAAlwSFlzAAAK6wAACusBgosNWgAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDYvMjkvMTUTtAt+AAAAkElEQVQokbXSyRaDIAwFUALOQ7W2iP//pQK6CGheF55mmXuYwlPqn0VEUp/uzPd0qAuFvqnsdKEInXVuziTCsDpfraYcxgi25MKh5rsxWHvDhMMIIJWf8EpAeei2CO/CJK8kXR2w5ED6E8B9m0zkNegc8W7ye8AM5LmBWYP/AX8KcgCyA/IGMqrkXJ92239aO3W4D6yL2ECSAAAAAElFTkSuQmCC",
            width: 0x19,
            height: 0x25,
          },
          viewerArea: {
            playbackBarBackgroundColor: "#000000",
            playbackBarBackgroundOpacity: 0.5,
            playbackBarBorderRadius: 0x0,
            playbackBarBorderSize: 0x0,
            playbackBarBottom: 0x5,
            playbackBarHeight: 0x6,
            playbackBarLeft: 0x0,
            playbackBarRight: 0x0,
            playbackBarProgressBackgroundColor: "#3399ff",
            playbackBarProgressOpacity: 0.5,
            playbackBarHeadBackgroundColor: "#cccccc",
            playbackBarHeadBorderColor: "#ffffff",
            playbackBarHeadBorderRadius: 0x7,
            playbackBarHeadBorderSize: 0x3,
            playbackBarHeadOpacity: 0x1,
            playbackBarHeadWidth: 0xe,
            playbackBarHeadHeight: 0xe,
            playbackBarHeadShadow: !![],
            playbackBarHeadShadowBlurRadius: 0x2,
            playbackBarHeadShadowColor: "#000000",
            playbackBarHeadShadowHorizontalLength: 0x0,
            playbackBarHeadShadowOpacity: 0.3,
            playbackBarHeadShadowSpread: 0x2,
            playbackBarHeadShadowVerticalLength: 0x0,
            backgroundColor: "#e6e6e6",
            backgroundOpacity: 0x1,
          },
        },
        optionsContainer: {
          gap: 0xa,
          width: "30%",
          height: "100%",
          overflow: "scroll",
          contentOpaque: !![],
        },
        option: {
          gap: 0xa,
          text: {
            fontColor: "#404040",
            fontFamily: "Arial",
            fontSize: 0x12,
            paddingTop: 0x9,
            textAlign: "left",
            verticalAlign: "middle",
            selected: {
              fontColor: "#000000",
              fontFamily: "Arial",
              fontSize: 0x12,
              paddingTop: 0x9,
              textAlign: "left",
            },
          },
          label: {
            borderRadius: 0x13,
            backgroundColor: "#000000",
            backgroundOpacity: 0.2,
            fontColor: "#ffffff",
            fontFamily: "Arial",
            fontSize: 0x12,
            fontWeight: "bold",
            height: 0x26,
            horizontalAlign: "center",
            pressedBackgroundOpacity: 0x1,
            verticalAlign: "middle",
            width: 0x26,
            correct: {
              borderRadius: 0x13,
              backgroundColor: "#39b54a",
              backgroundOpacity: 0x1,
              fontColor: "#ffffff",
              fontFamily: "Arial",
              fontSize: 0x12,
              fontWeight: "bold",
              height: 0x26,
              horizontalAlign: "center",
              pressedBackgroundOpacity: 0x1,
              verticalAlign: "middle",
              width: 0x26,
            },
            incorrect: {
              borderRadius: 0x13,
              backgroundColor: "#ed1c24",
              backgroundOpacity: 0x1,
              fontColor: "#ffffff",
              fontFamily: "Arial",
              fontSize: 0x12,
              fontWeight: "bold",
              height: 0x26,
              horizontalAlign: "center",
              pressedBackgroundOpacity: 0x1,
              verticalAlign: "middle",
              width: 0x26,
            },
          },
        },
        closeButton: {
          backgroundColor: "#009FE3",
          height: 0x2d,
          iconColor: "#FFFFFF",
          iconLineWidth: 0x2,
          iconHeight: 0x12,
          iconWidth: 0x12,
          width: 0x2d,
        },
      },
    },
    score: {
      veil: { backgroundColor: "#000000", backgroundOpacity: 0.5 },
      window: {
        backgroundColor: "#ffffff",
        horizontalAlign: "center",
        minWidth: 0x1f4,
        maxWidth: 0x5dc,
        paddingBottom: 0x14,
        paddingLeft: 0x14,
        paddingRight: 0x14,
        paddingTop: 0x14,
        content: { width: "100%", horizontalAlign: "center" },
        closeButton: {
          backgroundColor: "#009fe3",
          height: 0x2d,
          iconColor: "#ffffff",
          iconLineWidth: 0x2,
          iconHeight: 0x12,
          iconWidth: 0x12,
          width: 0x2d,
        },
        title: {
          fontColor: "#000000",
          fontFamily: "Arial",
          fontSize: 0x32,
          fontWeight: "800",
          paddingBottom: 0xf,
          paddingTop: 0x32,
          textAlign: "center",
        },
        description: {
          fontColor: "#000000",
          fontFamily: "Arial",
          fontSize: 0x10,
          fontWeight: "400",
          paddingLeft: 0x64,
          paddingRight: 0x64,
          paddingBottom: 0xf,
          paddingTop: 0xf,
          textAlign: "center",
        },
        statsContainer: {
          gap: 0x14,
          horizontalAlign: "center",
          paddingLeft: 0x64,
          paddingRight: 0x64,
          paddingBottom: 0xf,
          paddingTop: 0xf,
          verticalAlign: "middle",
          overflow: "scroll",
          contentOpaque: !![],
        },
        stats: {
          borderColor: "#009fe3",
          borderSize: 0x1,
          borderRadius: 0x4b,
          gap: 0x0,
          height: 0x96,
          horizontalAlign: "center",
          layout: "vertical",
          verticalAlign: "middle",
          minWidth: 0x96,
          title: {
            fontColor: "#000000",
            fontFamily: "Arial",
            fontSize: 0x14,
            fontWeight: "400",
            paddingTop: 0xa,
            paddingLeft: 0x5,
            paddingRight: 0x5,
          },
          mainValue: {
            fontColor: "#000000",
            fontFamily: "Arial",
            fontSize: 0x28,
            fontWeight: "700",
          },
          secondaryValue: {
            fontColor: "#000000",
            fontFamily: "Arial",
            fontSize: 0x14,
            fontWeight: "700",
          },
          label: {
            fontColor: "#000000",
            fontFamily: "Arial",
            fontSize: 0xf,
            fontWeight: "400",
          },
        },
        calification: {
          fontColor: "#009fe3",
          fontFamily: "Arial",
          fontSize: 0x1e,
          fontWeight: "700",
          textAlign: "center",
          paddingLeft: 0x64,
          paddingRight: 0x64,
          paddingBottom: 0xa,
          paddingTop: 0xf,
          verticalAlign: "middle",
          width: "100%",
        },
        timeContainer: {
          gap: 0x5,
          horizontalAlign: "center",
          paddingLeft: 0x64,
          paddingRight: 0x64,
          paddingBottom: 0xf,
          paddingTop: 0xa,
          verticalAlign: "middle",
          width: "100%",
        },
        buttonsContainer: {
          gap: 0x8,
          paddingLeft: 0x64,
          paddingRight: 0x64,
          paddingBottom: 0x32,
          paddingTop: 0x23,
          horizontalAlign: "center",
          verticalAlign: "middle",
          width: "100%",
          button: {
            backgroundColor: "#009fe3",
            fontColor: "#ffffff",
            fontFamily: "Arial",
            fontSize: 0xf,
            fontWeight: "600",
            horizontalAlign: "center",
            paddingLeft: 0x19,
            paddingRight: 0x19,
            paddingTop: 0xc,
            paddingBottom: 0xc,
            verticalAlign: "middle",
          },
        },
      },
    },
    timeout: {
      veil: { backgroundColor: "#000000", backgroundOpacity: 0.5 },
      window: {
        backgroundColor: "#ffffff",
        horizontalAlign: "center",
        gap: 0xf,
        paddingBottom: 0x37,
        paddingLeft: 0x50,
        paddingRight: 0x50,
        paddingTop: 0x2d,
        icon: {
          height: 0x48,
          url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAUAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgICAgICAgICAgMCAgIDBAMCAgMEBQQEBAQEBQYFBQUFBQUGBgcHCAcHBgkJCgoJCQwMDAwMDAwMDAwMDAwMDAEDAwMFBAUJBgYJDQsJCw0PDg4ODg8PDAwMDAwPDwwMDAwMDA8MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgASAA+AwERAAIRAQMRAf/EAHQAAAICAwEBAAAAAAAAAAAAAAUGAAQCAwcBCQEBAAAAAAAAAAAAAAAAAAAAABAAAQMDAgMHAwMBCQAAAAAAAQIDBAARBSExQRITUWFxkbEiBoGhFFJiIzLB0UJygqJDYyQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APv5QSglBydzJZHqOf8AvkD3HQOqA37AaAjhZ85zJxG3Jjzja1EKQtxSgfaeBNB0eglBKANl8w1jGwkAOylj+NnsH6ld1BliMqjKMrVydN9mweQNtb2IPfagkzOY6EShb3VdTu017j9TsPOgQspNiTHELiQxFCebnItdZPEgCgu4fKwcekfkQuo8FEplJCSoAi1he3rQO8PKQZ+kd8Fe5aV7VeR3+lAMzGeGOdTHZbDz+inea4SlJ2GnE0FtOaiLxzmRTdSWQOqyP6kqJACT4k70CtmMLkPzJEhtKpTTpU51Li6Rvym54DagAMy5Mdt1pl5TSHwA6lJte1AQx+Em5ABxCQywf+degP8AlG5oGRr4lEAHWlPLVxKAlI+4VQYP/EmSD+NLWlXAOgKHmLelArTMfNxjiesko1u0+gnlJHYrTWg0uOyp8hBcUqRIc5W0Xtc8AKAyxgskmHNWptSFrSltuMCLrPUSSTrawtQHfk88x4yIjSrOSr9Qjg2N/M0ADAYkT3i++LxY5F0/rVvy+HbQPU5yRHhuKgsB15AAaatpa4GgFthwoKj7M/IYxpIc/AmL5VOBJI23FxqL70Hs5zJRIcZMNsTZCeRD61AkmwsVWuNzQEHWW5TBZkthSXUjqNnWx7j3dtBzDJwHMZMU1clH9cd3YlPD6igcUZhxeAdnJsZLIDTncskJ5v8AcDQLPyN0u5V8HZlKG0+HKCfuTQO+GYEbGRE2sVoDiz3r92vhe1B5jse5DclurmKlJlK5kg8N+8660HuQy8THKQh7nW64LpabAKrdupAoFub8pdc/jx7Jb5tA64AVa9iRcetBcw+PmtyBkslIUhxwFCGVq9yub9V9u4UGz5VHDkJqRb3sOWv+1eh+4FArQ3iMXmI99FJZcA7CHUg+ooJnkFGWmA8VJUP9SQaB9jtonYdhrnKUPxkIKk7j2gH70GzGx2IcYQ2ZAfMckOG4JCiSbEDbwoBmShz28i1lMe0iQtLfTWys2tuLi5Hb20GWHxKo6nps1pH5r6ytKRYhsHU2toCSeFBZyUGFknWGHpPTfYJWllC0hZSbX9pueG9BW+TrCMWtJ3dcQlP0PN/ZQJURJMLLK4BlsE95eRb0oDvyuIUvMTUj2OJ6Th7FDUeY9KC38XyCVsqx7irONErY70nUj6HWgJmNDwjc7IoS64XLKcRcHdWydBxPGguNZGM5BbnuK/HYcF/5NCNbW86DVkMozAitS+QyG3lJCCg6WUL3v4CgyRAiuy2sryrTIU2OUE2Aum2o7bG1An/JsgmTJTFaVzNRb86hsVnfy2oNkeEtr41PfKTzyihYH/WhabH1NA6zIrU2O7GeF0OC1+IPAjwoOYSosvEywlRLbrZ5mXk7KHAigbcf8ljPoDOQAZdtYu2u2rx7PSgPOtQslH6JKH45sQG1aC21ik0HqnYMFlDTjrbDTSQlCFqGw20OpoFTK/JeolUfHXSFaLkkWNv2jh4mgD4fEuZJ8FQKYrZ/nc7f2jvNB0zpt9Po8g6XLydO2nLa1reFBnQVZkKNOaLMlsLT/hVspJ7QeFAlTPi0tolUNYkt8EKISseeh86AKvFZJB5TAfJ/a2pQ8wDQZtYjJunlTBeB7VpKB5qtQMEH4qolLk90BO/QbNye4q/uoHJplphtLTKA22gWShOgFBsoP//Z",
          width: 0x3e,
        },
        title: {
          fontColor: "#000000",
          fontFamily: "Arial",
          fontSize: 0x28,
          fontWeight: "800",
          textAlign: "center",
          paddingBottom: 0x14,
        },
        button: {
          backgroundColor: "#009fe3",
          fontColor: "#ffffff",
          fontFamily: "Arial",
          fontSize: 0xf,
          fontWeight: "600",
          horizontalAlign: "center",
          paddingLeft: 0x19,
          paddingRight: 0x19,
          paddingTop: 0xc,
          paddingBottom: 0xc,
          verticalAlign: "middle",
        },
        buttonsContainer: {
          horizontalAlign: "center",
          width: "100%",
          gap: 0xa,
        },
      },
    },
  };
  h7["theme"] = "theme" in h7 ? this["mixObject"](ha, h7["theme"]) : ha;
  if (h7["player"]["get"]("isMobile")) {
    var hb = this["mixObject"](h7["theme"], {
      question: {
        window: {
          width: "100%",
          height: "100%",
          minWidth: undefined,
          backgroundOpacity: 0x1,
          borderRadius: 0x0,
          paddingLeft: 0x0,
          paddingRight: 0x0,
          paddingBottom: 0x0,
          paddingTop: 0x0,
          verticalAlign: "middle",
          title: { paddingBottom: 0x19, paddingTop: 0x19 },
          bodyContainer: {
            layout: "vertical",
            horizontalAlign: "center",
            paddingLeft: 0x0,
            paddingRight: 0x0,
            gap: 0x14,
          },
          mediaContainer: { width: "100%", height: "45%" },
          optionsContainer: {
            width: "100%",
            height: "55%",
            paddingLeft: 0x14,
            paddingRight: 0x14,
          },
        },
      },
      score: {
        window: {
          description: { paddingLeft: 0xa, paddingRight: 0xa },
          calification: { fontSize: 0x14, paddingLeft: 0xa, paddingRight: 0xa },
        },
      },
    });
    h7["theme"] = hb;
  }
  var hc = this["get"]("data");
  var hd = document["getElementById"]("metaViewport");
  var he = hd
    ? /initial-scale=(\d+(\.\d+)?)/["exec"](hd["getAttribute"]("content"))
    : undefined;
  var hf = he ? he[0x1] : 0x1;
  hc["scorePortraitConfig"] = {
    theme: {
      window: {
        minWidth: 0xfa / hf,
        maxHeight: 0x258 / hf,
        content: { height: "100%" },
        statsContainer: {
          layout: "vertical",
          horizontalAlign: "center",
          maxHeight: 0x258,
          paddingLeft: 0x0,
          paddingRight: 0x0,
          width: "100%",
          height: "100%",
        },
        buttonsContainer: {
          paddingLeft: 0xa,
          paddingRight: 0xa,
          button: { paddingLeft: 0xf, paddingRight: 0xf },
        },
      },
    },
  };
  hc["scoreLandscapeConfig"] = {
    theme: {
      window: {
        title: { fontSize: 0x1e, paddingTop: 0xa },
        stats: { height: 0x64 },
        buttonsContainer: { paddingBottom: 0x14, paddingTop: 0xa },
        description: { paddingBottom: 0x5, paddingTop: 0x5 },
      },
    },
  };
  var hg = new TDV["Quiz"](h7);
  hg["setMaxListeners"](0x32);
  if (h9 === !![]) {
    hg["bind"](
      TDV["Quiz"]["EVENT_PROPERTIES_CHANGE"],
      function () {
        if (
          (hg["get"](TDV["Quiz"]["PROPERTY"]["QUESTIONS_ANSWERED"]) +
            hg["get"](TDV["Quiz"]["PROPERTY"]["ITEMS_FOUND"])) /
            (hg["get"](TDV["Quiz"]["PROPERTY"]["QUESTION_COUNT"]) +
              hg["get"](TDV["Quiz"]["PROPERTY"]["ITEM_COUNT"])) ==
          0x1
        )
          hg["finish"]();
      }["bind"](this)
    );
  }
  if (h8 === !![]) {
    hg["start"]();
    if (this["get"]("data")["tour"]["_isPaused"]) hg["pauseTimer"]();
  }
  hc["quiz"] = hg;
  hc["quizConfig"] = h7;
};
TDV["Tour"]["Script"]["_initSplitViewer"] = function (hh) {
  function hi() {
    var hD = hh["get"]("actualWidth");
    ht["get"]("children")[0x0]["set"]("width", hD);
    hu["get"]("children")[0x0]["set"]("width", hD);
    var hE = hx["get"]("left");
    var hF = typeof hE == "string" ? hj(hE) : hE;
    hF += hx["get"]("actualWidth") * 0.5;
    ht["set"]("width", hk(hF));
    hu["set"]("width", hk(hD - hF));
  }
  function hj(hG) {
    return (
      (parseFloat(hG["replace"]("%", "")) / 0x64) * hh["get"]("actualWidth")
    );
  }
  function hk(hH) {
    return (hH / hh["get"]("actualWidth")) * 0x64 + "%";
  }
  function hl(hI) {
    hm(hI["source"]);
  }
  function hm(hJ) {
    var hK = hJ == hz ? hy : hz;
    if ((hA && hJ != hA) || !hJ || !hK) return;
    var hL =
      hK["get"]("camera")["get"]("initialPosition")["get"]("yaw") -
      hJ["get"]("camera")["get"]("initialPosition")["get"]("yaw");
    hK["setPosition"](
      hJ["get"]("yaw") + hL,
      hJ["get"]("pitch"),
      hJ["get"]("roll"),
      hJ["get"]("hfov")
    );
  }
  function hn(hM) {
    hA = hM["source"];
  }
  function ho(hN) {
    hp(hN["source"]);
  }
  function hp(hO) {
    var hP = hO["get"]("viewerArea");
    if (hP == hv) {
      if (hy) {
        hy["get"]("camera")["set"]("hoverFactor", hB);
      }
      hy = hO;
      hA = hy;
      if (hy) {
        hB = hy["get"]("camera")["get"]("hoverFactor");
        hy["get"]("camera")["set"]("hoverFactor", 0x0);
      }
    } else if (hP == hw) {
      if (hz) {
        hz["get"]("camera")["set"]("hoverFactor", hC);
      }
      hz = hO;
      hA = hy;
      if (hz) {
        hC = hz["get"]("camera")["get"]("hoverFactor");
        hz["get"]("camera")["set"]("hoverFactor", 0x0);
      }
    }
    hm(hO);
  }
  function hq(hQ) {
    var hR = this["getCurrentPlayers"]();
    var hS = hR["length"];
    while (hS-- > 0x0) {
      var hU = hR[hS];
      if (hU["get"]("viewerArea") != hQ) {
        hR["splice"](hS, 0x1);
      }
    }
    for (hS = 0x0; hS < hR["length"]; ++hS) {
      var hU = hR[hS];
      hU["bind"]("preloadMediaShow", ho, this);
      hU["bind"]("cameraPositionChange", hl, this);
      hU["bind"]("userInteractionStart", hn, this);
      if (hU["get"]("panorama")) hp(hU);
    }
    return hR;
  }
  function hr(hV) {
    hp(this["getActivePlayerWithViewer"](hV["source"]));
    hm(hA);
  }
  var hs = hh["get"]("children");
  var ht = hs[0x0];
  var hu = hs[0x1];
  var hv = ht["get"]("children")[0x0];
  var hw = hu["get"]("children")[0x0];
  var hx = hs[0x2];
  var hy, hz, hA;
  var hB, hC;
  hq["call"](this, hv);
  hq["call"](this, hw);
  hv["bind"]("mouseDown", hr, this);
  hw["bind"]("mouseDown", hr, this);
  hh["bind"](
    "resize",
    function () {
      hx["set"](
        "left",
        (hh["get"]("actualWidth") - hx["get"]("actualWidth")) * 0.5
      );
      hi();
    },
    this
  );
  hx["bind"](
    "mouseDown",
    function (hW) {
      var hX = hW["pageX"];
      var hY = function (hZ) {
        var i0 = hZ["pageX"];
        var i1 = hX - i0;
        var i2 = hh["get"]("actualWidth");
        var i3 = hx["get"]("left");
        var i4 = (typeof i3 == "string" ? hj(i3) : i3) - i1;
        if (i4 < 0x0) {
          i0 -= i4;
          i4 = 0x0;
        } else if (i4 + hx["get"]("actualWidth") >= i2) {
          i0 -= i4 - (i2 - hx["get"]("actualWidth"));
          i4 = i2 - hx["get"]("actualWidth");
        }
        hx["set"]("left", i4);
        hi();
        hX = i0;
      };
      this["bind"]("mouseMove", hY, this);
      this["bind"](
        "mouseUp",
        function () {
          this["unbind"]("mouseMove", hY, this);
        },
        this
      );
    },
    this
  );
  hi();
};
TDV["Tour"]["Script"]["_initTwinsViewer"] = function (i5) {
  function i6() {
    var it = i5["get"]("actualWidth");
    ii["get"]("children")[0x0]["set"]("width", it);
    ij["get"]("children")[0x0]["set"]("width", it);
    var iu = im["get"]("left");
    var iv = typeof iu == "string" ? i7(iu) : iu;
    iv += im["get"]("actualWidth") * 0.5;
    ii["set"]("width", i8(iv));
    ij["set"]("width", i8(it - iv));
  }
  function i7(iw) {
    return (
      (parseFloat(iw["replace"]("%", "")) / 0x64) * i5["get"]("actualWidth")
    );
  }
  function i8(ix) {
    return (ix / i5["get"]("actualWidth")) * 0x64 + "%";
  }
  function i9(iy) {
    ia(iy["source"]);
  }
  function ia(iz) {
    var iA = iz == ip ? io : ip;
    if ((iq && iz != iq) || !iz || !iA) return;
    var iB =
      iA["get"]("camera")["get"]("initialPosition")["get"]("yaw") -
      iz["get"]("camera")["get"]("initialPosition")["get"]("yaw");
    iA["setPosition"](
      iz["get"]("yaw") + iB,
      iz["get"]("pitch"),
      iz["get"]("roll"),
      iz["get"]("hfov")
    );
  }
  function ib(iC) {
    iq = iC["source"];
  }
  function ic(iD) {
    id(iD["source"]);
  }
  function id(iE) {
    var iF = iE["get"]("viewerArea");
    if (iF == ik) {
      if (io) {
        io["get"]("camera")["set"]("hoverFactor", ir);
      }
      io = iE;
      iq = io;
      if (io) {
        ir = io["get"]("camera")["get"]("hoverFactor");
        io["get"]("camera")["set"]("hoverFactor", 0x0);
      }
    } else if (iF == il) {
      if (ip) {
        ip["get"]("camera")["set"]("hoverFactor", is);
      }
      ip = iE;
      iq = io;
      if (ip) {
        is = ip["get"]("camera")["get"]("hoverFactor");
        ip["get"]("camera")["set"]("hoverFactor", 0x0);
      }
    }
    ia(iE);
  }
  function ie(iG) {
    var iH = this["getCurrentPlayers"]();
    var iI = iH["length"];
    while (iI-- > 0x0) {
      var iK = iH[iI];
      if (iK["get"]("viewerArea") != iG) {
        iH["splice"](iI, 0x1);
      }
    }
    for (iI = 0x0; iI < iH["length"]; ++iI) {
      var iK = iH[iI];
      iK["bind"]("preloadMediaShow", ic, this);
      iK["bind"]("cameraPositionChange", i9, this);
      iK["bind"]("userInteractionStart", ib, this);
      if (iK["get"]("panorama")) id(iK);
    }
    return iH;
  }
  function ig(iL) {
    id(this["getActivePlayerWithViewer"](iL["source"]));
    ia(iq);
  }
  var ih = i5["get"]("children");
  var ii = ih[0x0];
  var ij = ih[0x1];
  var ik = ii["get"]("children")[0x0];
  var il = ij["get"]("children")[0x0];
  var im = ih[0x2];
  var io, ip, iq;
  var ir, is;
  ie["call"](this, ik);
  ie["call"](this, il);
  ik["bind"]("mouseDown", ig, this);
  il["bind"]("mouseDown", ig, this);
  i5["bind"](
    "resize",
    function () {
      im["set"](
        "left",
        (i5["get"]("actualWidth") - im["get"]("actualWidth")) * 0.5
      );
      i6();
    },
    this
  );
  i6();
};
TDV["Tour"]["Script"]["isCardboardViewMode"] = function () {
  var iM = this["getByClassName"]("PanoramaPlayer");
  return iM["length"] > 0x0 && iM[0x0]["get"]("viewMode") == "cardboard";
};
TDV["Tour"]["Script"]["isPanorama"] = function (iN) {
  return (
    ["Panorama", "HDRPanorama", "LivePanorama", "Video360", "VideoPanorama"][
      "indexOf"
    ](iN["get"]("class")) != -0x1
  );
};
TDV["Tour"]["Script"]["keepCompVisible"] = function (iO, iP) {
  var iQ = "keepVisibility_" + iO["get"]("id");
  var iR = this["getKey"](iQ);
  if (iR == undefined && iP) {
    this["registerKey"](iQ, iP);
  } else if (iR != undefined && !iP) {
    this["unregisterKey"](iQ);
  }
};
TDV["Tour"]["Script"]["_initItemWithComps"] = function (
  iS,
  iT,
  iU,
  iV,
  iW,
  iX,
  iY,
  iZ
) {
  var j0 = iS["get"]("items")[iT];
  var j1 = j0["get"]("media");
  var j2 = j1["get"]("loop") == undefined || j1["get"]("loop");
  var j3 = iZ > 0x0;
  var j4 = this["rootPlayer"];
  var j5 = function (jd) {
    var je = iX ? iX["get"]("class") : undefined;
    var jf = undefined;
    switch (je) {
      case "FadeInEffect":
      case "FadeOutEffect":
        jf = j4["createInstance"](jd ? "FadeInEffect" : "FadeOutEffect");
        break;
      case "SlideInEffect":
      case "SlideOutEffect":
        jf = j4["createInstance"](jd ? "SlideInEffect" : "SlideOutEffect");
        break;
    }
    if (jf) {
      jf["set"]("duration", iX["get"]("duration"));
      jf["set"]("easing", iX["get"]("easing"));
      if (je["indexOf"]("Slide") != -0x1)
        jf["set"](
          jd ? "from" : "to",
          iX["get"](iX["get"]("class") == "SlideInEffect" ? "from" : "to")
        );
    }
    return jf;
  };
  var j6 = function () {
    for (var jg = 0x0, jh = iU["length"]; jg < jh; ++jg) {
      var ji = iU[jg];
      if (iZ > 0x0) {
        this["setComponentVisibility"](ji, !iW, 0x0, j5(!iW));
      } else {
        var jj = "visibility_" + ji["get"]("id");
        if (this["existsKey"](jj)) {
          if (this["getKey"](jj))
            this["setComponentVisibility"](ji, !![], 0x0, j5(!![]));
          else this["setComponentVisibility"](ji, ![], 0x0, j5(![]));
          this["unregisterKey"](jj);
        }
      }
    }
    j0["unbind"]("end", j6, this);
    if (!j2) j1["unbind"]("end", j6, this);
  };
  var j7 = function () {
    j0["unbind"]("stop", j7, this, !![]);
    j0["unbind"]("stop", j7, this);
    j0["unbind"]("begin", j7, this, !![]);
    j0["unbind"]("begin", j7, this);
    for (var jk = 0x0, jl = iU["length"]; jk < jl; ++jk) {
      this["keepCompVisible"](iU[jk], ![]);
    }
  };
  var j8 = function (jm, jn, jo) {
    var jp = function () {
      var jq = function (ju, jv, jw) {
        j4["setComponentVisibility"](
          ju,
          jv,
          jn,
          jw,
          jv ? "showEffect" : "hideEffect",
          ![]
        );
        if (jo > 0x0) {
          var jx = jn + jo + (jw != undefined ? jw["get"]("duration") : 0x0);
          j4["setComponentVisibility"](
            ju,
            !jv,
            jx,
            j5(!jv),
            jv ? "hideEffect" : "showEffect",
            !![]
          );
        }
      };
      for (var jr = 0x0, js = iU["length"]; jr < js; ++jr) {
        var jt = iU[jr];
        if (iW == "toggle") {
          if (!jt["get"]("visible")) jq(jt, !![], j5(!![]));
          else jq(jt, ![], j5(![]));
        } else {
          jq(jt, iW, j5(iW));
        }
      }
      j0["unbind"](jm, jp, this);
      if (jm == "end" && !j2) j1["unbind"](jm, jp, this);
    };
    j0["bind"](jm, jp, this);
    if (jm == "end" && !j2) j1["bind"](jm, jp, this);
  };
  if (iV == "begin") {
    for (var j9 = 0x0, ja = iU["length"]; j9 < ja; ++j9) {
      var jb = iU[j9];
      this["keepCompVisible"](jb, !![]);
      if (j3) {
        var jc = "visibility_" + jb["get"]("id");
        this["registerKey"](jc, jb["get"]("visible"));
      }
    }
    j0["bind"]("stop", j7, this, !![]);
    j0["bind"]("stop", j7, this);
    j0["bind"]("begin", j7, this, !![]);
    j0["bind"]("begin", j7, this);
    if (j3) {
      j0["bind"]("end", j6, this);
      if (!j2) j1["bind"]("end", j6, this);
    }
  } else if (iV == "end" && iZ > 0x0) {
    j8("begin", iZ, 0x0);
    iZ = 0x0;
  }
  if (iV != undefined) j8(iV, iY, iZ);
};
TDV["Tour"]["Script"]["loadFromCurrentMediaPlayList"] = function (jy, jz, jA) {
  var jB = jy["get"]("selectedIndex");
  var jC = jy["get"]("items")["length"];
  var jD = (jB + jz) % jC;
  while (jD < 0x0) {
    jD = jC + jD;
  }
  if (jB != jD) {
    if (jA) {
      var jE = jy["get"]("items")[jD];
      this["skip3DTransitionOnce"](jE["get"]("player"));
    }
    jy["set"]("selectedIndex", jD);
  }
};
TDV["Tour"]["Script"]["mixObject"] = function (jF, jG) {
  return this["assignObjRecursively"](jG, this["copyObjRecursively"](jF));
};
TDV["Tour"]["Script"]["downloadFile"] = function (jH) {
  if (
    (navigator["userAgent"]["toLowerCase"]()["indexOf"]("chrome") > -0x1 ||
      navigator["userAgent"]["toLowerCase"]()["indexOf"]("safari") > -0x1) &&
    !/(iP)/g["test"](navigator["userAgent"])
  ) {
    var jI = document["createElement"]("a");
    jI["href"] = jH;
    jI["setAttribute"]("target", "_blank");
    if (jI["download"] !== undefined) {
      var jJ = jH["substring"](jH["lastIndexOf"]("/") + 0x1, jH["length"]);
      jI["download"] = jJ;
    }
    if (document["createEvent"]) {
      var jK = document["createEvent"]("MouseEvents");
      jK["initEvent"]("click", !![], !![]);
      jI["dispatchEvent"](jK);
      return;
    }
  }
  window["open"](jH, "_blank");
};
TDV["Tour"]["Script"]["openLink"] = function (jL, jM) {
  if (!jL || jL == location["href"]) {
    return;
  }
  if (jM == "_top" || jM == "_self") {
    this["updateDeepLink"](!![], !![], !![]);
  }
  var jN =
    (window &&
      window["process"] &&
      window["process"]["versions"] &&
      window["process"]["versions"]["electron"]) ||
    (navigator &&
      navigator["userAgent"] &&
      navigator["userAgent"]["indexOf"]("Electron") >= 0x0);
  if (jN && jM == "_blank") {
    if (jL["startsWith"]("files/")) {
      jL = "/" + jL;
    }
    if (jL["startsWith"]("/")) {
      var jO = window["location"]["href"]["split"]("/");
      jO["pop"]();
      jL = jO["join"]("/") + jL;
    }
    var jP = jL["split"](".")["pop"]()["toLowerCase"]();
    if (
      ["pdf", "zip", "xls", "xlsx"]["indexOf"](jP) == -0x1 ||
      jL["startsWith"]("file://")
    ) {
      var jQ = window["require"]("electron")["shell"];
      jQ["openExternal"](jL);
    } else {
      window["open"](jL, jM);
    }
  } else if (jN && (jM == "_top" || jM == "_self")) {
    window["location"] = jL;
  } else {
    var jR = window["open"](jL, jM);
    jR["focus"]();
  }
};
TDV["Tour"]["Script"]["pauseCurrentPlayers"] = function (jS) {
  var jT = this["getCurrentPlayers"]();
  var jU = jT["length"];
  while (jU-- > 0x0) {
    var jV = jT[jU];
    if (
      jV["get"]("state") == "playing" ||
      (jV["get"]("data") && jV["get"]("data")["playing"]) ||
      (jV["get"]("viewerArea") &&
        jV["get"]("viewerArea")["get"]("id") == this["getMainViewer"]()) ||
      (jV["get"]("camera") &&
        jV["get"]("camera")["get"]("idleSequence") &&
        jV["get"]("camera")["get"]("timeToIdle") > 0x0 &&
        jV["get"]("state") == "playing")
    ) {
      var jW = this["getMediaFromPlayer"](jV);
      if (jS && jW && jW["get"]("class") != "Video360" && "pauseCamera" in jV) {
        jV["pauseCamera"]();
      } else {
        jV["pause"]();
      }
    } else {
      jT["splice"](jU, 0x1);
    }
  }
  return jT;
};
TDV["Tour"]["Script"]["pauseGlobalAudiosWhilePlayItem"] = function (
  jX,
  jY,
  jZ
) {
  var k0 = function () {
    if (jX["get"]("selectedIndex") != jY) {
      this["resumeGlobalAudios"]();
    }
  };
  this["pauseGlobalAudios"](jZ, !![]);
  this["executeFunctionWhenChange"](jX, jY, k0, k0);
};
TDV["Tour"]["Script"]["pauseGlobalAudios"] = function (k1, k2) {
  this["stopTextToSpeech"]();
  if (window["pausedAudiosLIFO"] == undefined) window["pausedAudiosLIFO"] = [];
  var k3 = this["getByClassName"]("VideoPanoramaOverlay");
  for (var k5 = k3["length"] - 0x1; k5 >= 0x0; --k5) {
    var k6 = k3[k5];
    if (k6["get"]("video")["get"]("hasAudio") == ![]) k3["splice"](k5, 0x1);
  }
  var k7 = this["getByClassName"]("Audio")["concat"](k3);
  var k8 = {};
  if (window["currentGlobalAudios"] != undefined)
    k7 = k7["concat"](
      Object["values"](window["currentGlobalAudios"])["map"](function (kc) {
        if (!kc["allowResume"]) k8[kc["audio"]["get"]("id")] = kc["audio"];
        return kc["audio"];
      })
    );
  var k9 = [];
  for (var k5 = 0x0, ka = k7["length"]; k5 < ka; ++k5) {
    var kb = k7[k5];
    if (
      kb &&
      kb["get"]("state") == "playing" &&
      (k1 == undefined || k1["indexOf"](kb) == -0x1)
    ) {
      if (kb["get"]("id") in k8) {
        kb["stop"]();
      } else {
        kb["pause"]();
        k9["push"](kb);
      }
    }
  }
  if (k2 || k9["length"] > 0x0) window["pausedAudiosLIFO"]["push"](k9);
  return k9;
};
TDV["Tour"]["Script"]["resumeGlobalAudios"] = function () {
  if (window["pausedAudiosLIFO"] == undefined) return;
  if (window["resumeAudiosBlocked"]) {
    if (window["pausedAudiosLIFO"]["length"] > 0x1) {
      window["pausedAudiosLIFO"][window["pausedAudiosLIFO"]["length"] - 0x2] =
        window["pausedAudiosLIFO"][window["pausedAudiosLIFO"]["length"] - 0x2][
          "concat"
        ](
          window["pausedAudiosLIFO"][window["pausedAudiosLIFO"]["length"] - 0x1]
        );
      window["pausedAudiosLIFO"]["splice"](
        window["pausedAudiosLIFO"]["length"] - 0x1,
        0x1
      );
    }
    return;
  }
  var kd = window["pausedAudiosLIFO"]["pop"]();
  if (!kd) return;
  for (var ke = 0x0, kf = kd["length"]; ke < kf; ++ke) {
    var kg = kd[ke];
    if (kg["get"]("state") == "paused") kg["play"]();
  }
};
TDV["Tour"]["Script"]["pauseGlobalAudio"] = function (kh) {
  var ki = window["currentGlobalAudios"];
  if (ki) {
    var kj = ki[kh["get"]("id")];
    if (kj) kh = kj["audio"];
  }
  if (kh["get"]("state") == "playing") kh["pause"]();
};
TDV["Tour"]["Script"]["playAudioList"] = function (kk, kl) {
  if (kk["length"] == 0x0) return;
  var km = -0x1;
  var kn;
  var ko = this["playGlobalAudio"];
  var kp = function () {
    if (++km >= kk["length"]) {
      if (!kl) return;
      km = 0x0;
    }
    kn = kk[km];
    ko(kn, !![], kp, !![]);
  };
  kp();
};
TDV["Tour"]["Script"]["playGlobalAudioWhilePlay"] = function (
  kq,
  kr,
  ks,
  kt,
  ku,
  kv
) {
  var kw = function (kI) {
    if (kI["data"]["previousSelectedIndex"] == kr) {
      this["stopGlobalAudio"](ks);
      if (kA) {
        var kJ = kz["get"]("media");
        var kK = kJ["get"]("audios");
        kK["splice"](kK["indexOf"](ks), 0x1);
        kJ["set"]("audios", kK);
      }
      kq["unbind"]("change", kw, this);
      if (ku) ku();
    }
  };
  var ky = window["currentGlobalAudios"];
  if (ky && ks["get"]("id") in ky) {
    ks = ky[ks["get"]("id")]["audio"];
    if (ks["get"]("state") != "playing") {
      ks["play"]();
    }
    return ks;
  }
  kq["bind"]("change", kw, this);
  var kz = kq["get"]("items")[kr];
  var kA = kz["get"]("class") == "PanoramaPlayListItem";
  if (kA) {
    var kB = kz["get"]("media");
    var ky = (kB["get"]("audios") || [])["slice"]();
    if (ks["get"]("class") == "MediaAudio") {
      var kC = this["rootPlayer"]["createInstance"]("PanoramaAudio");
      kC["set"]("autoplay", ![]);
      kC["set"]("audio", ks["get"]("audio"));
      kC["set"]("loop", ks["get"]("loop"));
      kC["set"]("id", ks["get"]("id"));
      var kD = ks["getBindings"]("stateChange");
      for (var kE = 0x0; kE < kD["length"]; ++kE) {
        var kF = kD[kE];
        if (typeof kF == "string") kF = new Function("event", kF);
        kC["bind"]("stateChange", kF, this);
      }
      ks = kC;
    }
    ky["push"](ks);
    kB["set"]("audios", ky);
  }
  var kG = this["playGlobalAudio"](ks, kt, function () {
    kq["unbind"]("change", kw, this);
    if (ku) ku["call"](this);
  });
  if (kv === !![]) {
    var kH = function () {
      if (kG["get"]("state") == "playing") {
        this["pauseGlobalAudios"]([kG], !![]);
      } else if (kG["get"]("state") == "stopped") {
        this["resumeGlobalAudios"]();
        kG["unbind"]("stateChange", kH, this);
      }
    };
    kG["bind"]("stateChange", kH, this);
  }
  return kG;
};
TDV["Tour"]["Script"]["playGlobalAudio"] = function (kL, kM, kN, kO) {
  var kP = function () {
    kL["unbind"]("end", kP, this);
    this["stopGlobalAudio"](kL);
    if (kN) kN["call"](this);
  };
  kL = this["getGlobalAudio"](kL);
  var kQ = window["currentGlobalAudios"];
  if (!kQ) {
    kQ = window["currentGlobalAudios"] = {};
  }
  kQ[kL["get"]("id")] = { audio: kL, asBackground: kO || ![], allowResume: kM };
  if (kL["get"]("state") == "playing") {
    return kL;
  }
  if (!kL["get"]("loop")) {
    kL["bind"]("end", kP, this);
  }
  kL["play"]();
  return kL;
};
TDV["Tour"]["Script"]["resumePlayers"] = function (kR, kS) {
  for (var kT = 0x0; kT < kR["length"]; ++kT) {
    var kU = kR[kT];
    var kV = this["getMediaFromPlayer"](kU);
    if (!kV) continue;
    if (kS && kV["get"]("class") != "Video360" && "pauseCamera" in kU) {
      kU["resumeCamera"]();
    } else if (kU["get"]("state") != "playing") {
      var kW = kU["get"]("data");
      if (!kW) {
        kW = {};
        kU["set"]("data", kW);
      }
      kW["playing"] = !![];
      var kX = function () {
        if (kU["get"]("state") == "playing") {
          delete kW["playing"];
          kU["unbind"]("stateChange", kX, this);
        }
      };
      kU["bind"]("stateChange", kX, this);
      kU["play"]();
    }
  }
};
TDV["Tour"]["Script"]["stopGlobalAudios"] = function (kY) {
  var kZ = window["currentGlobalAudios"];
  var l0 = this;
  if (kZ) {
    Object["keys"](kZ)["forEach"](function (l1) {
      var l2 = kZ[l1];
      if (!kY || (kY && !l2["asBackground"])) {
        l0["stopGlobalAudio"](l2["audio"]);
      }
    });
  }
};
TDV["Tour"]["Script"]["stopGlobalAudio"] = function (l3) {
  var l4 = window["currentGlobalAudios"];
  if (l4) {
    var l5 = l4[l3["get"]("id")];
    if (l5) {
      l3 = l5["audio"];
      delete l4[l3["get"]("id")];
      if (Object["keys"](l4)["length"] == 0x0) {
        window["currentGlobalAudios"] = undefined;
      }
    }
  }
  if (l3) l3["stop"]();
};
TDV["Tour"]["Script"]["setCameraSameSpotAsMedia"] = function (l6, l7) {
  var l8 = this["getCurrentPlayerWithMedia"](l7);
  if (l8 != undefined) {
    var l9 = l6["get"]("initialPosition");
    l9["set"]("yaw", l8["get"]("yaw"));
    l9["set"]("pitch", l8["get"]("pitch"));
    l9["set"]("hfov", l8["get"]("hfov"));
  }
};
TDV["Tour"]["Script"]["setComponentVisibility"] = function (
  la,
  lb,
  lc,
  ld,
  le,
  lf
) {
  var lg = this["getKey"]("keepVisibility_" + la["get"]("id"));
  if (lg) return;
  this["unregisterKey"]("visibility_" + la["get"]("id"));
  var lh = function () {
    if (ld && le) {
      la["set"](le, ld);
    }
    la["set"]("visible", lb);
    if (la["get"]("class") == "ViewerArea") {
      try {
        if (lb) la["restart"]();
        else if (la["get"]("playbackState") == "playing") la["pause"]();
      } catch (lm) {}
    }
  };
  var li = "effectTimeout_" + la["get"]("id");
  if (!lf && window["hasOwnProperty"](li)) {
    var lk = window[li];
    if (lk instanceof Array) {
      for (var ll = 0x0; ll < lk["length"]; ll++) {
        clearTimeout(lk[ll]);
      }
    } else {
      clearTimeout(lk);
    }
    delete window[li];
  } else if (lb == la["get"]("visible") && !lf) return;
  if (lc && lc > 0x0) {
    var lk = setTimeout(function () {
      if (window[li] instanceof Array) {
        var ln = window[li];
        var lo = ln["indexOf"](lk);
        ln["splice"](lo, 0x1);
        if (ln["length"] == 0x0) {
          delete window[li];
        }
      } else {
        delete window[li];
      }
      lh();
    }, lc);
    if (window["hasOwnProperty"](li)) {
      window[li] = [window[li], lk];
    } else {
      window[li] = lk;
    }
  } else {
    lh();
  }
};
TDV["Tour"]["Script"]["setLocale"] = function (lp) {
  this["stopTextToSpeech"]();
  var lq = this["get"]("data")["localeManager"];
  if (lq) this["get"]("data")["localeManager"]["setLocale"](lp);
  else {
    this["get"]("data")["defaultLocale"] = lp;
    this["get"]("data")["forceDefaultLocale"] = !![];
  }
};
TDV["Tour"]["Script"]["setEndToItemIndex"] = function (lr, ls, lt) {
  var lu = function () {
    if (lr["get"]("selectedIndex") == ls) {
      var lv = lr["get"]("items")[lt];
      this["skip3DTransitionOnce"](lv["get"]("player"));
      lr["set"]("selectedIndex", lt);
    }
  };
  this["executeFunctionWhenChange"](lr, ls, lu);
};
TDV["Tour"]["Script"]["setMapLocation"] = function (lw, lx) {
  var ly = function () {
    lw["unbind"]("stop", ly, this);
    lz["set"]("mapPlayer", null);
  };
  lw["bind"]("stop", ly, this);
  var lz = lw["get"]("player");
  lz["set"]("mapPlayer", lx);
};
TDV["Tour"]["Script"]["setMainMediaByIndex"] = function (lA) {
  var lB = undefined;
  if (lA >= 0x0 && lA < this["mainPlayList"]["get"]("items")["length"]) {
    this["mainPlayList"]["set"]("selectedIndex", lA);
    lB = this["mainPlayList"]["get"]("items")[lA];
  }
  return lB;
};
TDV["Tour"]["Script"]["setMainMediaByName"] = function (lC) {
  var lD = this["getMainViewer"]();
  var lE = this["_getPlayListsWithViewer"](lD);
  for (var lF = 0x0, lG = lE["length"]; lF < lG; ++lF) {
    var lH = lE[lF];
    var lI = lH["get"]("items");
    for (var lJ = 0x0, lK = lI["length"]; lJ < lK; ++lJ) {
      var lL = lI[lJ];
      var lM = lL["get"]("media")["get"]("data");
      if (
        lM !== undefined &&
        lM["label"] == lC &&
        lL["get"]("player")["get"]("viewerArea") == lD
      ) {
        lH["set"]("selectedIndex", lJ);
        return lL;
      }
    }
  }
};
TDV["Tour"]["Script"]["setMediaBehaviour"] = function (lN, lO, lP, lQ) {
  var lR = this;
  var lS = function (mf) {
    if (mf["data"]["state"] == "stopped" && lQ) {
      lW["call"](this, !![]);
    }
  };
  var lT = function () {
    m2["unbind"]("begin", lT, lR);
    var mg = m2["get"]("media");
    if (
      mg["get"]("class") != "Panorama" ||
      (mg["get"]("camera") != undefined &&
        mg["get"]("camera")["get"]("initialSequence") != undefined)
    ) {
      m3["bind"]("stateChange", lS, lR);
    }
  };
  var lU = function () {
    var mh = lZ["get"]("selectedIndex");
    if (mh != -0x1) {
      m1 = mh;
      lW["call"](this, ![]);
    }
  };
  var lV = function () {
    lW["call"](this, ![]);
  };
  var lW = function (mi) {
    if (!lZ) return;
    var mj = m2["get"]("media");
    if (
      (mj["get"]("class") == "Video360" || mj["get"]("class") == "Video") &&
      mj["get"]("loop") == !![] &&
      !mi
    )
      return;
    lN["set"]("selectedIndex", -0x1);
    if (ma && m9 != -0x1) {
      if (ma) {
        if (
          m9 > 0x0 &&
          ma["get"]("movements")[m9 - 0x1]["get"]("class") ==
            "TargetPanoramaCameraMovement"
        ) {
          var mk = mb["get"]("initialPosition");
          var ml = mk["get"]("yaw");
          var mm = mk["get"]("pitch");
          var mn = mk["get"]("hfov");
          var mo = ma["get"]("movements")[m9 - 0x1];
          mk["set"]("yaw", mo["get"]("targetYaw"));
          mk["set"]("pitch", mo["get"]("targetPitch"));
          mk["set"]("hfov", mo["get"]("targetHfov"));
          var mp = function (ms) {
            mk["set"]("yaw", ml);
            mk["set"]("pitch", mm);
            mk["set"]("hfov", mn);
            m5["unbind"]("end", mp, this);
          };
          m5["bind"]("end", mp, this);
        }
        ma["set"]("movementIndex", m9);
      }
    }
    if (m3) {
      m2["unbind"]("begin", lT, this);
      m3["unbind"]("stateChange", lS, this);
      for (var mq = 0x0; mq < mc["length"]; ++mq) {
        mc[mq]["unbind"]("click", lV, this);
      }
    }
    if (m8) {
      var mr = this["getMediaFromPlayer"](m3);
      if (
        lZ["get"]("items")["length"] > 0x1 &&
        (mr == undefined || mr == m2["get"]("media"))
      ) {
        lZ["set"]("selectedIndex", m1);
      }
      if (lN != lZ) lZ["unbind"]("change", lU, this);
    } else {
      m6["set"]("visible", m7);
    }
    lZ = undefined;
  };
  if (!lP) {
    var lX = lN["get"]("selectedIndex");
    var lY =
      lX != -0x1
        ? lN["get"]("items")[lN["get"]("selectedIndex")]["get"]("player")
        : this["getActivePlayerWithViewer"](this["getMainViewer"]());
    if (lY) {
      lP = this["getMediaFromPlayer"](lY);
    }
  }
  var lZ = undefined;
  if (lP) {
    var m0 = this["getPlayListsWithMedia"](lP, !![]);
    lZ =
      m0["indexOf"](lN) != -0x1 ? lN : m0["length"] > 0x0 ? m0[0x0] : undefined;
  }
  if (!lZ) {
    lN["set"]("selectedIndex", lO);
    return;
  }
  var m1 = lZ["get"]("selectedIndex");
  var m2 = lN["get"]("items")[lO];
  var m3 = m2["get"]("player");
  var m4 = this["getMediaFromPlayer"](m3);
  if (
    (lN["get"]("selectedIndex") == lO && m4 == m2["get"]("media")) ||
    m1 == -0x1
  ) {
    return;
  }
  if (lN["get"]("selectedIndex") == lO && m4 != m2["get"]("media"))
    lN["set"]("selectedIndex", -0x1);
  var m5 = lZ["get"]("items")[m1];
  var m6 = m3["get"]("viewerArea");
  var m7 = m6["get"]("visible");
  var m8 = m6 == m5["get"]("player")["get"]("viewerArea");
  if (m8) {
    if (lN != lZ) {
      lZ["set"]("selectedIndex", -0x1);
      lZ["bind"]("change", lU, this);
    }
  } else {
    m6["set"]("visible", !![]);
  }
  var m9 = -0x1;
  var ma = undefined;
  var mb = m5["get"]("camera");
  if (mb) {
    ma = mb["get"]("initialSequence");
    if (ma) {
      m9 = ma["get"]("movementIndex");
    }
  }
  lN["set"]("selectedIndex", lO);
  var mc = [];
  var md = function (mt) {
    var mu = m3["get"](mt);
    if (mu == undefined) return;
    if (Array["isArray"](mu)) mc = mc["concat"](mu);
    else mc["push"](mu);
  };
  md("buttonStop");
  for (var me = 0x0; me < mc["length"]; ++me) {
    mc[me]["bind"]("click", lV, this);
  }
  m2["bind"]("begin", lT, lR);
  this["executeFunctionWhenChange"](lN, lO, lQ ? lV : undefined);
};
TDV["Tour"]["Script"]["setOverlayBehaviour"] = function (mv, mw, mx, my) {
  var mz = function () {
    switch (mx) {
      case "triggerClick":
        this["triggerOverlay"](mv, "click");
        break;
      case "stop":
      case "play":
      case "pause":
        mv[mx]();
        break;
      case "togglePlayPause":
      case "togglePlayStop":
        if (mv["get"]("state") == "playing")
          mv[mx == "togglePlayPause" ? "pause" : "stop"]();
        else mv["play"]();
        break;
    }
    if (my) {
      if (window["overlaysDispatched"] == undefined)
        window["overlaysDispatched"] = {};
      var mE = mv["get"]("id");
      window["overlaysDispatched"][mE] = !![];
      setTimeout(function () {
        delete window["overlaysDispatched"][mE];
      }, 0x3e8);
    }
  };
  if (
    my &&
    window["overlaysDispatched"] != undefined &&
    mv["get"]("id") in window["overlaysDispatched"]
  )
    return;
  var mA = this["getFirstPlayListWithMedia"](mw, !![]);
  if (mA != undefined) {
    var mB = this["getPlayListItemByMedia"](mA, mw);
    var mC = mB["get"]("player");
    if (
      mA["get"]("items")["indexOf"](mB) != mA["get"]("selectedIndex") ||
      (this["isPanorama"](mB["get"]("media")) &&
        mC["get"]("rendererPanorama") != mB["get"]("media"))
    ) {
      var mD = function (mF) {
        mB["unbind"]("begin", mD, this);
        mz["call"](this);
      };
      mB["bind"]("begin", mD, this);
      return;
    }
  }
  mz["call"](this);
};
TDV["Tour"]["Script"]["setOverlaysVisibility"] = function (mG, mH, mI) {
  var mJ = "overlayEffects";
  var mK = undefined;
  var mL = this["getKey"](mJ);
  if (!mL) {
    mL = {};
    this["registerKey"](mJ, mL);
  }
  for (var mM = 0x0, mN = mG["length"]; mM < mN; ++mM) {
    var mO = mG[mM];
    if (mI && mI > 0x0) {
      mL[mO["get"]("id")] = setTimeout(mP["bind"](this, mO), mI);
    } else {
      mP["call"](this, mO);
    }
  }
  function mP(mQ) {
    var mR = mQ["get"]("id");
    var mS = mL[mR];
    if (mS) {
      clearTimeout(mS);
      delete mS[mR];
    }
    var mT = mH == "toggle" ? !mQ["get"]("enabled") : mH;
    mQ["set"]("enabled", mT);
    var mV = mQ["get"]("data");
    if (mT && mV && "group" in mV) {
      var mW = this["getOverlaysByGroupname"](mV["group"]);
      for (var mX = 0x0, mY = mW["length"]; mX < mY; ++mX) {
        var n0 = mW[mX];
        if (n0 != mQ) n0["set"]("enabled", !mT);
      }
    }
    if (!mK) mK = this["getByClassName"]("AdjacentPanorama");
    for (var n1 = 0x0, n2 = mK["length"]; n1 < n2; ++n1) {
      var n3 = mK[n1];
      var mV = n3["get"]("data");
      if (!mV) continue;
      var n0 = this[mV["overlayID"]];
      if (n0 && n0 == mQ) {
        n3["set"]("enabledInSurfaceSelection", n0["get"]("enabled"));
      }
    }
  }
};
TDV["Tour"]["Script"]["setOverlaysVisibilityByTags"] = function (
  n4,
  n5,
  n6,
  n7,
  n8
) {
  var n9 = n6
    ? this["getPanoramaOverlaysByTags"](n6, n4, n7)
    : this["getOverlaysByTags"](n4, n7);
  this["setOverlaysVisibility"](n9, n5, n8);
};
TDV["Tour"]["Script"]["setComponentsVisibilityByTags"] = function (
  na,
  nb,
  nc,
  nd,
  ne
) {
  var nf = this["getComponentsByTags"](na, ne);
  for (var ng = 0x0, nh = nf["length"]; ng < nh; ++ng) {
    var ni = nf[ng];
    if (nb == "toggle") ni["get"]("visible") ? nd(ni) : nc(ni);
    else nb ? nc(ni) : nd(ni);
  }
};
TDV["Tour"]["Script"]["setPanoramaCameraWithCurrentSpot"] = function (nj, nk) {
  var nl = this["getActiveMediaWithViewer"](nk || this["getMainViewer"]());
  if (
    nl != undefined &&
    (nl["get"]("class")["indexOf"]("Panorama") != -0x1 ||
      nl["get"]("class") == "Video360")
  ) {
    var nm = nj["get"]("media");
    var nn = this["cloneCamera"](nj["get"]("camera"));
    this["setCameraSameSpotAsMedia"](nn, nl);
    this["startPanoramaWithCamera"](nm, nn);
  }
};
TDV["Tour"]["Script"]["setPanoramaCameraWithSpot"] = function (
  no,
  np,
  nq,
  nr,
  ns
) {
  var nt = no["get"]("selectedIndex");
  var nu = no["get"]("items");
  var nv = np["get"]("player");
  if (nu[nt] == np || nv["get"]("rendererPanorama") == np["get"]("media")) {
    if (nq === undefined) nq = nv["get"]("yaw");
    if (nr === undefined) nr = nv["get"]("pitch");
    if (ns === undefined) ns = nv["get"]("hfov");
    nv["moveTo"](nq, nr, nv["get"]("roll"), ns);
  } else {
    var nw = np["get"]("media");
    var nx = this["cloneCamera"](np["get"]("camera"));
    var ny = nx["get"]("initialPosition");
    if (nq !== undefined) ny["set"]("yaw", nq);
    if (nr !== undefined) ny["set"]("pitch", nr);
    if (ns !== undefined) ny["set"]("hfov", ns);
    this["startPanoramaWithCamera"](nw, nx);
  }
};
TDV["Tour"]["Script"]["setSurfaceSelectionHotspotMode"] = function (nz) {
  var nA = this["getByClassName"]("HotspotPanoramaOverlay");
  var nB = this["getByClassName"]("PanoramaPlayer");
  var nC = nz == "hotspotEnabled";
  var nD = nz == "circleEnabled";
  var nE = !!nz;
  nA["forEach"](function (nF) {
    var nG = nF["get"]("data");
    if (nG && nG["hasPanoramaAction"] == !![])
      nF["set"]("enabledInSurfaceSelection", nC);
  });
  nB["forEach"](function (nH) {
    nH["set"]("adjacentPanoramaPositionsEnabled", nD);
    nH["set"]("surfaceSelectionEnabled", nE);
  });
  this["get"]("data")["surfaceSelectionHotspotMode"] = nz;
};
TDV["Tour"]["Script"]["setValue"] = function (nI, nJ, nK) {
  try {
    if ("set" in nI) nI["set"](nJ, nK);
    else nI[nJ] = nK;
  } catch (nL) {}
};
TDV["Tour"]["Script"]["setStartTimeVideo"] = function (nM, nN) {
  var nO = this["getPlayListItems"](nM);
  var nP = [];
  var nQ = function () {
    for (var nU = 0x0; nU < nO["length"]; ++nU) {
      var nV = nO[nU];
      nV["set"]("startTime", nP[nU]);
      nV["unbind"]("stop", nQ, this);
    }
  };
  for (var nR = 0x0; nR < nO["length"]; ++nR) {
    var nS = nO[nR];
    var nT = nS["get"]("player");
    if (!nT) continue;
    if (nT["get"]("video") == nM && nT["get"]("state") == "playing") {
      nT["seek"](nN);
    } else {
      nP["push"](nS["get"]("startTime"));
      nS["set"]("startTime", nN);
      nS["bind"]("stop", nQ, this);
    }
  }
};
TDV["Tour"]["Script"]["setStartTimeVideoSync"] = function (nW, nX) {
  if (nW && nX) this["setStartTimeVideo"](nW, nX["get"]("currentTime"));
};
TDV["Tour"]["Script"]["skip3DTransitionOnce"] = function (nY) {
  if (nY && nY["get"]("class") == "PanoramaPlayer") {
    var nZ = nY["get"]("viewerArea");
    if (nZ && nZ["get"]("translationTransitionEnabled") == !![]) {
      var o0 = function () {
        nY["unbind"]("preloadMediaShow", o0, this);
        nZ["set"]("translationTransitionEnabled", !![]);
      };
      nZ["set"]("translationTransitionEnabled", ![]);
      nY["bind"]("preloadMediaShow", o0, this);
    }
  }
};
TDV["Tour"]["Script"]["shareSocial"] = function (o1, o2, o3, o4, o5, o6) {
  if (o2 == undefined) {
    o2 = location["href"]["split"](
      location["search"] || location["hash"] || /[?#]/
    )[0x0];
  }
  if (o3) {
    o2 += this["updateDeepLink"](o4, o5, ![]);
  }
  o2 = (function (o8) {
    switch (o8) {
      case "email":
        return "mailto:?body=" + o2;
      case "facebook":
        var o9 = o2["indexOf"]("?") != -0x1;
        o2 = o2["replace"]("#", "?");
        if (o9) {
          var oa = o2["lastIndexOf"]("?");
          o2 = o2["substring"](0x0, oa) + "&" + o2["substring"](oa + 0x1);
        }
        return (
          "https://www.facebook.com/sharer/sharer.php?u=" +
          encodeURIComponent(o2)
        );
      case "linkedin":
        return (
          "https://www.linkedin.com/shareArticle?mini=true&url=" +
          encodeURIComponent(o2)
        );
      case "pinterest":
        return "https://pinterest.com/pin/create/button/?url=" + o2;
      case "telegram":
        return "https://t.me/share/url?url=" + o2;
      case "twitter":
        return "https://twitter.com/intent/tweet?source=webclient&url=" + o2;
      case "whatsapp":
        return "https://api.whatsapp.com/send/?text=" + encodeURIComponent(o2);
      default:
        return o2;
    }
  })(o1);
  if (o6) {
    for (var o7 in o6) {
      o2 += "&" + o7 + "=" + o6[o7];
    }
  }
  if (o1 == "clipboard") this["copyToClipboard"](o2);
  else this["openLink"](o2, "_blank");
};
TDV["Tour"]["Script"]["showComponentsWhileMouseOver"] = function (
  ob,
  oc,
  od,
  oe
) {
  var of = function (oj) {
    for (var ok = 0x0, ol = oc["length"]; ok < ol; ok++) {
      var om = oc[ok];
      if (!oe || oe(om, oj)) om["set"]("visible", oj);
    }
  };
  if (this["get"]("isMobile")) {
    of["call"](this, !![]);
  } else {
    var og = -0x1;
    var oh = function () {
      of["call"](this, !![]);
      if (og >= 0x0) clearTimeout(og);
      ob["bind"]("rollOut", oi, this);
    };
    var oi = function () {
      var on = function () {
        of["call"](this, ![]);
      };
      ob["unbind"]("rollOut", oi, this);
      og = setTimeout(on["bind"](this), od);
    };
    ob["bind"]("rollOver", oh, this);
  }
};
TDV["Tour"]["Script"]["showPopupMedia"] = function (oo, op, oq, or, os, ot) {
  var ou = this;
  var ov = function () {
    window["resumeAudiosBlocked"] = ![];
    oq["set"]("selectedIndex", -0x1);
    ou["getMainViewer"]()["set"]("toolTipEnabled", !![]);
    this["resumePlayers"](oA, !![]);
    if (oz) {
      this["unbind"]("resize", ox, this);
    }
    oo["unbind"]("close", ov, this);
  };
  var ow = function () {
    oo["hide"]();
  };
  var ox = function () {
    var oB = function (oS) {
      return oo["get"](oS) || 0x0;
    };
    var oC = ou["get"]("actualWidth");
    var oD = ou["get"]("actualHeight");
    var oE = ou["getMediaWidth"](op);
    var oF = ou["getMediaHeight"](op);
    var oG = parseFloat(or) / 0x64;
    var oH = parseFloat(os) / 0x64;
    var oI = oG * oC;
    var oJ = oH * oD;
    var oK = oB("footerHeight");
    var oL = oB("headerHeight");
    if (!oL) {
      var oM =
        oB("closeButtonIconHeight") +
        oB("closeButtonPaddingTop") +
        oB("closeButtonPaddingBottom");
      var oN =
        ou["getPixels"](oB("titleFontSize")) +
        oB("titlePaddingTop") +
        oB("titlePaddingBottom");
      oL = oM > oN ? oM : oN;
      oL += oB("headerPaddingTop") + oB("headerPaddingBottom");
    }
    var oO =
      oI -
      oB("bodyPaddingLeft") -
      oB("bodyPaddingRight") -
      oB("paddingLeft") -
      oB("paddingRight");
    var oP =
      oJ -
      oL -
      oK -
      oB("bodyPaddingTop") -
      oB("bodyPaddingBottom") -
      oB("paddingTop") -
      oB("paddingBottom");
    var oQ = oO / oP;
    var oR = oE / oF;
    if (oQ > oR) {
      oI =
        oP * oR +
        oB("bodyPaddingLeft") +
        oB("bodyPaddingRight") +
        oB("paddingLeft") +
        oB("paddingRight");
    } else {
      oJ =
        oO / oR +
        oL +
        oK +
        oB("bodyPaddingTop") +
        oB("bodyPaddingBottom") +
        oB("paddingTop") +
        oB("paddingBottom");
    }
    if (oI > oC * oG) {
      oI = oC * oG;
    }
    if (oJ > oD * oH) {
      oJ = oD * oH;
    }
    oo["set"]("width", oI);
    oo["set"]("height", oJ);
    oo["set"]("x", (oC - oB("actualWidth")) * 0.5);
    oo["set"]("y", (oD - oB("actualHeight")) * 0.5);
  };
  if (ot) {
    this["executeFunctionWhenChange"](oq, 0x0, ow);
  }
  var oy = op["get"]("class");
  var oz = oy == "Video" || oy == "Video360";
  oq["set"]("selectedIndex", 0x0);
  if (oz) {
    this["bind"]("resize", ox, this);
    ox();
    oq["get"]("items")[0x0]["get"]("player")["play"]();
  } else {
    oo["set"]("width", or);
    oo["set"]("height", os);
  }
  window["resumeAudiosBlocked"] = !![];
  this["getMainViewer"]()["set"]("toolTipEnabled", ![]);
  var oA = this["pauseCurrentPlayers"](!![]);
  oo["bind"]("close", ov, this);
  oo["show"](this, !![]);
};
TDV["Tour"]["Script"]["showPopupImage"] = function (
  oT,
  oU,
  oV,
  oW,
  oX,
  oY,
  oZ,
  p0,
  p1,
  p2,
  p3,
  p4
) {
  var p5 = ![];
  var p6 = function () {
    pn["unbind"]("loaded", p9, this);
    pd["call"](this);
  };
  var p7 = function () {
    pn["unbind"]("click", p7, this);
    if (pr != undefined) {
      clearTimeout(pr);
    }
  };
  var p8 = function () {
    setTimeout(ph, 0x0);
  };
  var p9 = function () {
    this["unbind"]("click", p6, this);
    pm["set"]("visible", !![]);
    ph();
    po["set"]("visible", !![]);
    pn["unbind"]("loaded", p9, this);
    pn["bind"]("resize", p8, this);
    pr = setTimeout(pa["bind"](this), 0xc8);
  };
  var pa = function () {
    pr = undefined;
    if (p0) {
      pn["bind"]("click", p7, this);
      pc["call"](this);
    }
    pn["bind"]("userInteractionStart", pi, this);
    pn["bind"]("userInteractionEnd", pj, this);
    pn["bind"]("backgroundClick", pd, this);
    if (oU) {
      pn["bind"]("click", pf, this);
      pn["set"]("imageCursor", "hand");
    }
    po["bind"]("click", pd, this);
    if (p3) p3["call"](this);
  };
  var pb = function () {
    if (p0 && pr) {
      clearTimeout(pr);
      pr = undefined;
    }
  };
  var pc = function () {
    if (p0) {
      pb();
      pr = setTimeout(pd["bind"](this), p0);
    }
  };
  var pd = function () {
    this["getMainViewer"]()["set"]("toolTipEnabled", !![]);
    p5 = !![];
    if (pr) clearTimeout(pr);
    if (ps) clearTimeout(ps);
    if (p0) p7();
    if (p4) p4["call"](this);
    pn["set"]("visible", ![]);
    if (oY && oY["get"]("duration") > 0x0) {
      oY["bind"]("end", pe, this);
    } else {
      pn["set"]("image", null);
    }
    po["set"]("visible", ![]);
    pm["set"]("visible", ![]);
    this["unbind"]("click", p6, this);
    pn["unbind"]("backgroundClick", pd, this);
    pn["unbind"]("userInteractionStart", pi, this);
    pn["unbind"]("userInteractionEnd", pj, this, !![]);
    pn["unbind"]("resize", p8, this);
    if (oU) {
      pn["unbind"]("click", pf, this);
      pn["set"]("cursor", "default");
    }
    po["unbind"]("click", pd, this);
    this["resumePlayers"](pq, p1 == null || p2);
    if (p2) {
      this["resumeGlobalAudios"]();
    }
    if (p1) {
      this["stopGlobalAudio"](p1);
    }
  };
  var pe = function () {
    pn["set"]("image", null);
    oY["unbind"]("end", pe, this);
  };
  var pf = function () {
    pn["set"]("image", pg() ? oT : oU);
  };
  var pg = function () {
    return pn["get"]("image") == oU;
  };
  var ph = function () {
    var pt =
      pn["get"]("actualWidth") -
      pn["get"]("imageLeft") -
      pn["get"]("imageWidth") +
      0xa;
    var pu = pn["get"]("imageTop") + 0xa;
    if (pt < 0xa) pt = 0xa;
    if (pu < 0xa) pu = 0xa;
    po["set"]("right", pt);
    po["set"]("top", pu);
  };
  var pi = function () {
    pb();
    if (ps) {
      clearTimeout(ps);
      ps = undefined;
    } else {
      po["set"]("visible", ![]);
    }
  };
  var pj = function () {
    pc["call"](this);
    if (!p5) {
      ps = setTimeout(pk, 0x12c);
    }
  };
  var pk = function () {
    ps = undefined;
    po["set"]("visible", !![]);
    ph();
  };
  var pl = function (pv) {
    var pw = pv["get"]("data");
    if (pw && "extraLevels" in pw) {
      var px = this["rootPlayer"]["createInstance"](pv["get"]("class"));
      var py = pw["extraLevels"];
      px["set"]("levels", pv["get"]("levels")["concat"](py));
      pv = px;
    }
    return pv;
  };
  this["getMainViewer"]()["set"]("toolTipEnabled", ![]);
  var pm = this["veilPopupPanorama"];
  var pn = this["zoomImagePopupPanorama"];
  var po = this["closeButtonPopupPanorama"];
  if (oZ) {
    for (var pp in oZ) {
      po["set"](pp, oZ[pp]);
    }
  }
  var pq = this["pauseCurrentPlayers"](p1 == null || !p2);
  if (p2) {
    this["pauseGlobalAudios"](null, !![]);
  }
  if (p1) {
    this["playGlobalAudio"](p1, !![]);
  }
  var pr = undefined;
  var ps = undefined;
  oT = pl["call"](this, oT);
  if (oU) oU = pl["call"](this, oU);
  pn["bind"]("loaded", p9, this);
  setTimeout(
    function () {
      this["bind"]("click", p6, this, ![]);
    }["bind"](this),
    0x0
  );
  pn["set"]("image", oT);
  pn["set"]("customWidth", oV);
  pn["set"]("customHeight", oW);
  pn["set"]("showEffect", oX);
  pn["set"]("hideEffect", oY);
  pn["set"]("visible", !![]);
  return pn;
};
TDV["Tour"]["Script"]["showPopupPanoramaOverlay"] = function (
  pz,
  pA,
  pB,
  pC,
  pD,
  pE,
  pF
) {
  var pG = this["isCardboardViewMode"]();
  if (
    pz["get"]("visible") ||
    (!pG && this["zoomImagePopupPanorama"]["get"]("visible"))
  )
    return;
  this["getMainViewer"]()["set"]("toolTipEnabled", ![]);
  if (!pG) {
    var pH = this["zoomImagePopupPanorama"];
    var pI = pz["get"]("showDuration");
    var pJ = pz["get"]("hideDuration");
    var pL = this["pauseCurrentPlayers"](pE == null || !pF);
    var pM = pz["get"]("popupMaxWidth");
    var pN = pz["get"]("popupMaxHeight");
    var pO = function () {
      var pR = function () {
        if (!this["isCardboardViewMode"]()) pz["set"]("visible", ![]);
      };
      pz["unbind"]("showEnd", pO, this);
      pz["set"]("showDuration", 0x1);
      pz["set"]("hideDuration", 0x1);
      this["showPopupImage"](
        pB,
        pC,
        pz["get"]("popupMaxWidth"),
        pz["get"]("popupMaxHeight"),
        null,
        null,
        pA,
        pD,
        pE,
        pF,
        pR,
        pP
      );
    };
    var pP = function () {
      var pS = function () {
        pz["unbind"]("showEnd", pS, this);
        pz["set"]("visible", ![]);
        pz["set"]("showDuration", pI);
        pz["set"]("popupMaxWidth", pM);
        pz["set"]("popupMaxHeight", pN);
      };
      this["resumePlayers"](pL, pE == null || !pF);
      var pT = pH["get"]("imageWidth");
      var pU = pH["get"]("imageHeight");
      pz["bind"]("showEnd", pS, this, !![]);
      pz["set"]("showDuration", 0x1);
      pz["set"]("hideDuration", pJ);
      pz["set"]("popupMaxWidth", pT);
      pz["set"]("popupMaxHeight", pU);
      if (pz["get"]("visible")) pS();
      else pz["set"]("visible", !![]);
      this["getMainViewer"]()["set"]("toolTipEnabled", !![]);
    };
    pz["bind"]("showEnd", pO, this, !![]);
  } else {
    var pQ = function () {
      this["resumePlayers"](pL, pE == null || pF);
      if (pF) {
        this["resumeGlobalAudios"]();
      }
      if (pE) {
        this["stopGlobalAudio"](pE);
      }
      pz["unbind"]("hideEnd", pQ, this);
      this["getMainViewer"]()["set"]("toolTipEnabled", !![]);
    };
    var pL = this["pauseCurrentPlayers"](pE == null || !pF);
    if (pF) {
      this["pauseGlobalAudios"](null, !![]);
    }
    if (pE) {
      this["playGlobalAudio"](pE, !![]);
    }
    pz["bind"]("hideEnd", pQ, this, !![]);
  }
  pz["set"]("visible", !![]);
};
TDV["Tour"]["Script"]["showPopupPanoramaVideoOverlay"] = function (pV, pW, pX) {
  var pY = this;
  var pZ = function () {
    pV["unbind"]("showEnd", pZ);
    q3["bind"]("click", q1, this);
    q2();
    q3["set"]("visible", !![]);
  };
  var q0 = function () {
    if (!pV["get"]("loop")) q1();
  };
  var q1 = function () {
    window["resumeAudiosBlocked"] = ![];
    pY["getMainViewer"]()["set"]("toolTipEnabled", !![]);
    pV["set"]("visible", ![]);
    q3["set"]("visible", ![]);
    q3["unbind"]("click", q1, pY);
    pV["unbind"]("end", q0, pY);
    pV["unbind"]("hideEnd", q1, pY, !![]);
    pY["resumePlayers"](q5, !![]);
    if (pX) {
      pY["resumeGlobalAudios"]();
    }
  };
  var q2 = function () {
    var q6 = 0xa;
    var q7 = 0xa;
    q3["set"]("right", q6);
    q3["set"]("top", q7);
  };
  this["getMainViewer"]()["set"]("toolTipEnabled", ![]);
  var q3 = this["closeButtonPopupPanorama"];
  if (pW) {
    for (var q4 in pW) {
      q3["set"](q4, pW[q4]);
    }
  }
  window["resumeAudiosBlocked"] = !![];
  var q5 = this["pauseCurrentPlayers"](!![]);
  if (pX) {
    this["pauseGlobalAudios"]();
  }
  pV["bind"]("end", q0, this, !![]);
  pV["bind"]("showEnd", pZ, this, !![]);
  pV["bind"]("hideEnd", q1, this, !![]);
  pV["set"]("visible", !![]);
};
TDV["Tour"]["Script"]["showWindow"] = function (q8, q9, qa) {
  if (q8["get"]("visible") == !![]) {
    return;
  }
  var qb = function () {
    this["getMainViewer"]()["set"]("toolTipEnabled", !![]);
    if (qa) {
      this["resumeGlobalAudios"]();
    }
    qc();
    this["resumePlayers"](qf, !qa);
    q8["unbind"]("close", qb, this);
  };
  var qc = function () {
    q8["unbind"]("click", qc, this);
    if (qd != undefined) {
      clearTimeout(qd);
    }
  };
  var qd = undefined;
  if (q9) {
    var qe = function () {
      q8["hide"]();
    };
    q8["bind"]("click", qc, this);
    qd = setTimeout(qe, q9);
  }
  this["getMainViewer"]()["set"]("toolTipEnabled", ![]);
  if (qa) {
    this["pauseGlobalAudios"](null, !![]);
  }
  var qf = this["pauseCurrentPlayers"](!qa);
  q8["bind"]("close", qb, this);
  q8["show"](this, !![]);
};
TDV["Tour"]["Script"]["startPanoramaWithCamera"] = function (qg, qh) {
  var qi = this["getByClassName"]("PlayList");
  if (qi["length"] == 0x0) return;
  var qj =
    window["currentPanoramasWithCameraChanged"] == undefined ||
    !(qg["get"]("id") in window["currentPanoramasWithCameraChanged"]);
  var qk = [];
  for (var qm = 0x0, qn = qi["length"]; qm < qn; ++qm) {
    var qo = qi[qm];
    var qp = qo["get"]("items");
    for (var qq = 0x0, qr = qp["length"]; qq < qr; ++qq) {
      var qt = qp[qq];
      if (
        qt["get"]("media") == qg &&
        (qt["get"]("class") == "PanoramaPlayListItem" ||
          qt["get"]("class") == "Video360PlayListItem")
      ) {
        if (qj) {
          qk["push"]({ camera: qt["get"]("camera"), item: qt });
        }
        qt["set"]("camera", qh);
      }
    }
  }
  if (qk["length"] > 0x0) {
    if (window["currentPanoramasWithCameraChanged"] == undefined) {
      window["currentPanoramasWithCameraChanged"] = {};
    }
    var qu = qg["get"]("id");
    window["currentPanoramasWithCameraChanged"][qu] = qk;
    var qv = function () {
      if (qu in window["currentPanoramasWithCameraChanged"]) {
        delete window["currentPanoramasWithCameraChanged"][qu];
      }
      for (var qx = 0x0; qx < qk["length"]; qx++) {
        qk[qx]["item"]["set"]("camera", qk[qx]["camera"]);
        qk[qx]["item"]["unbind"]("end", qv, this);
      }
    };
    for (var qm = 0x0; qm < qk["length"]; qm++) {
      var qw = qk[qm];
      var qt = qw["item"];
      this["skip3DTransitionOnce"](qt["get"]("player"));
      qt["bind"]("end", qv, this);
    }
  }
};
TDV["Tour"]["Script"]["stopAndGoCamera"] = function (qy, qz) {
  var qA = qy["get"]("initialSequence");
  qA["pause"]();
  var qB = function () {
    qA["play"]();
  };
  setTimeout(qB, qz);
};
TDV["Tour"]["Script"]["syncPlaylists"] = function (qC) {
  var qD = function (qL, qM) {
    for (var qN = 0x0, qO = qC["length"]; qN < qO; ++qN) {
      var qP = qC[qN];
      if (qP != qM) {
        var qQ = qP["get"]("items");
        for (var qR = 0x0, qS = qQ["length"]; qR < qS; ++qR) {
          if (qQ[qR]["get"]("media") == qL) {
            if (qP["get"]("selectedIndex") != qR) {
              qP["set"]("selectedIndex", qR);
            }
            break;
          }
        }
      }
    }
  };
  var qE = function (qT) {
    var qU = qT["source"];
    var qV = qU["get"]("selectedIndex");
    if (qV < 0x0) return;
    var qW = qU["get"]("items")[qV]["get"]("media");
    qD(qW, qU);
  };
  var qF = function (qX) {
    var qY = qX["source"]["get"]("panoramaMapLocation");
    if (qY) {
      var qZ = qY["get"]("map");
      qD(qZ);
    }
  };
  for (var qH = 0x0, qJ = qC["length"]; qH < qJ; ++qH) {
    qC[qH]["bind"]("change", qE, this);
  }
  var qK = this["getByClassName"]("MapPlayer");
  for (var qH = 0x0, qJ = qK["length"]; qH < qJ; ++qH) {
    qK[qH]["bind"]("panoramaMapLocation_change", qF, this);
  }
};
TDV["Tour"]["Script"]["translate"] = function (r0) {
  return this["get"]("data")["localeManager"]["trans"](r0);
};
TDV["Tour"]["Script"]["triggerOverlay"] = function (r1, r2) {
  if (r1["get"]("areas") != undefined) {
    var r3 = r1["get"]("areas");
    for (var r4 = 0x0; r4 < r3["length"]; ++r4) {
      r3[r4]["trigger"](r2);
    }
  } else {
    r1["trigger"](r2);
  }
};
TDV["Tour"]["Script"]["updateDeepLink"] = function (r5, r6, r7) {
  var r8 = this["mainPlayList"]["get"]("selectedIndex");
  var r9;
  var ra;
  if (r8 >= 0x0) {
    r9 = "#media=" + (r8 + 0x1);
    ra = this["mainPlayList"]["get"]("items")[r8]["get"]("media");
  } else {
    ra = this["getActiveMediaWithViewer"](this["getMainViewer"]());
    if (ra != undefined) {
      var rc = ra["get"]("data");
      if (rc) {
        r9 = "#media-name=" + rc["label"];
      }
    }
  }
  if (ra) {
    if (r5) {
      var rd = this["getActivePlayerWithViewer"](this["getMainViewer"]());
      if (rd && rd["get"]("class") == "PanoramaPlayer") {
        r9 +=
          "&yaw=" +
          rd["get"]("yaw")["toFixed"](0x2) +
          "&pitch=" +
          rd["get"]("pitch")["toFixed"](0x2);
      }
    }
    if (r6) {
      var re = this["getOverlays"](ra);
      var rf = [];
      var rg = [];
      for (var rh = 0x0, ri = re["length"]; rh < ri; ++rh) {
        var rj = re[rh];
        var rk = rj["get"]("enabled");
        var rc = rj["get"]("data");
        if (rk === undefined || !rc || !rc["label"]) continue;
        var rl = encodeURIComponent(rc["label"]);
        var rm = rc["group"];
        if (rk != rc["defaultEnabledValue"]) {
          if (rk) {
            rf["push"](rl);
          } else if (!rm) {
            rg["push"](rl);
          }
        }
      }
      if (rf["length"] > 0x0) r9 += "&son=" + rf["join"](",");
      if (rg["length"] > 0x0) r9 += "&hon=" + rg["join"](",");
    }
  }
  if (r9 && r7 === !![]) {
    location["hash"] = r9;
  }
  return r9;
};
TDV["Tour"]["Script"]["updateMediaLabelFromPlayList"] = function (rn, ro, rp) {
  var rq = function () {
    var rs = rn["get"]("selectedIndex");
    if (rs >= 0x0) {
      var rt = function () {
        rw["unbind"]("begin", rt);
        ru(rs);
      };
      var ru = function (rx) {
        var ry = rw["get"]("media");
        var rz = ry["get"]("data");
        var rA = rz !== undefined ? rz["description"] : undefined;
        rv(rA);
      };
      var rv = function (rB) {
        if (rB !== undefined) {
          ro["set"](
            "html",
            "<div\x20style=\x22text-align:left\x22><SPAN\x20STYLE=\x22color:#FFFFFF;font-size:12px;font-family:Verdana\x22><span\x20color=\x22white\x22\x20font-family=\x22Verdana\x22\x20font-size=\x2212px\x22>" +
              rB +
              "</SPAN></div>"
          );
        } else {
          ro["set"]("html", "");
        }
        var rC = ro["get"]("html");
        ro["set"]("visible", rC !== undefined && rC);
      };
      var rw = rn["get"]("items")[rs];
      if (ro["get"]("html")) {
        rv("Loading...");
        rw["bind"]("begin", rt);
      } else {
        ru(rs);
      }
    }
  };
  var rr = function () {
    ro["set"]("html", undefined);
    rn["unbind"]("change", rq, this);
    rp["unbind"]("stop", rr, this);
  };
  if (rp) {
    rp["bind"]("stop", rr, this);
  }
  rn["bind"]("change", rq, this);
  rq();
};
TDV["Tour"]["Script"]["updateVideoCues"] = function (rD, rE) {
  var rF = rD["get"]("items")[rE];
  var rG = rF["get"]("media");
  if (rG["get"]("cues")["length"] == 0x0) return;
  var rH = rF["get"]("player");
  var rI = [];
  var rJ = function () {
    if (rD["get"]("selectedIndex") != rE) {
      rG["unbind"]("cueChange", rK, this);
      rD["unbind"]("change", rJ, this);
    }
  };
  var rK = function (rL) {
    var rM = rL["data"]["activeCues"];
    for (var rN = 0x0, rO = rI["length"]; rN < rO; ++rN) {
      var rP = rI[rN];
      if (
        rM["indexOf"](rP) == -0x1 &&
        (rP["get"]("startTime") > rH["get"]("currentTime") ||
          rP["get"]("endTime") < rH["get"]("currentTime") + 0.5)
      ) {
        rP["trigger"]("end");
      }
    }
    rI = rM;
  };
  rG["bind"]("cueChange", rK, this);
  rD["bind"]("change", rJ, this);
};
TDV["Tour"]["Script"]["visibleComponentsIfPlayerFlagEnabled"] = function (
  rQ,
  rR
) {
  var rS = this["get"](rR);
  for (var rT in rQ) {
    rQ[rT]["set"]("visible", rS);
  }
};
TDV["Tour"]["Script"]["quizStart"] = function () {
  var rU = this["get"]("data")["quiz"];
  return rU ? rU["start"]() : undefined;
};
TDV["Tour"]["Script"]["quizFinish"] = function () {
  var rV = this["get"]("data")["quiz"];
  return rV ? rV["finish"]() : undefined;
};
TDV["Tour"]["Script"]["quizSetItemFound"] = function (rW) {
  var rX = this["get"]("data")["quiz"];
  if (rX) rX["setItemFound"](rW);
};
TDV["Tour"]["Script"]["quizShowQuestion"] = function (rY) {
  var rZ = this["get"]("data");
  var s0 = rZ["quiz"];
  var s1;
  if (s0) {
    var s2 = this["pauseCurrentPlayers"](!![]);
    var s3 = this[rY];
    var s4;
    if (!s3["media"]) {
      s4 = this["get"]("isMobile")
        ? {
            theme: {
              window: {
                height: undefined,
                maxHeight: this["get"]("actualHeight"),
                optionsContainer: { height: "100%" },
              },
            },
          }
        : {
            theme: {
              window: {
                width: "40%",
                height: undefined,
                maxHeight: 0x2bc,
                optionsContainer: { width: "100%" },
              },
            },
          };
    } else if (
      this["get"]("isMobile") &&
      this["get"]("orientation") == "landscape"
    ) {
      s4 = {
        theme: {
          window: {
            bodyContainer: {
              layout: "horizontal",
              paddingLeft: 0x1e,
              paddingRight: 0x1e,
            },
            mediaContainer: { width: "60%", height: "100%" },
            buttonsContainer: { paddingLeft: 0x14, paddingRight: 0x14 },
            optionsContainer: {
              width: "40%",
              height: "100%",
              paddingLeft: 0x0,
              paddingRight: 0x0,
            },
          },
        },
      };
    }
    if (!s3["canClose"]) {
      s4 = this["mixObject"](s4 || {}, {
        theme: {
          window: {
            closeButton: {
              width: 0x0,
              height: 0x0,
              paddingTop: 0x0,
              paddingBottom: 0x0,
              paddingLeft: 0x0,
              paddingRight: 0x0,
            },
          },
        },
      });
    }
    if (this["get"]("isMobile") && this["get"]("orientation") == "landscape") {
      var s5 = this["get"]("data")["tour"]["getNotchValue"]();
      if (s5 > 0x0) {
        s4 = this["mixObject"](s4 || {}, {
          theme: { window: { width: undefined, left: s5, right: s5 } },
        });
      }
    }
    var s6 =
      this["get"]("data")["textToSpeechConfig"]["speechOnQuizQuestion"] &&
      !!s3["title"];
    if (s6) this["textToSpeech"](s3["title"], rY);
    s1 = s0["showQuestion"](rY, s4);
    s1["then"](
      function (s7) {
        if (s6) this["stopTextToSpeech"]();
        this["resumePlayers"](s2, !![]);
      }["bind"](this)
    );
  }
  return s1;
};
TDV["Tour"]["Script"]["quizShowScore"] = function (s8) {
  var s9 = this["get"]("data");
  var sa = s9["quiz"];
  if (sa) {
    if (this["get"]("isMobile")) {
      s8 = s8 || {};
      s8 = this["mixObject"](
        s8,
        s9[
          this["get"]("orientation") == "portrait"
            ? "scorePortraitConfig"
            : "scoreLandscapeConfig"
        ]
      );
    }
    return sa["showScore"](s8);
  }
};
TDV["Tour"]["Script"]["quizShowTimeout"] = function (sb, sc) {
  var sd = this["get"]("data");
  var se = sd["quiz"];
  if (se) {
    if (this["get"]("isMobile")) {
      sc = sc || {};
      sc = this["mixObject"](
        sc,
        sd[
          this["get"]("orientation") == "portrait"
            ? "scorePortraitConfig"
            : "scoreLandscapeConfig"
        ]
      );
    }
    se["showTimeout"](sb, sc);
  }
};
TDV["Tour"]["Script"]["stopTextToSpeech"] = function (sf) {
  if (
    window["speechSynthesis"] &&
    (sf == undefined || this["t2sLastID"] == sf)
  ) {
    var sg = window["speechSynthesis"];
    if (sg["speaking"]) {
      sg["cancel"]();
    }
    this["t2sLastID"] = undefined;
  }
};
TDV["Tour"]["Script"]["textToSpeech"] = function (sh, si, sj) {
  if (this["get"]("mute")) {
    return;
  }
  if (window["speechSynthesis"]) {
    var sk = this["get"]("data");
    var sl = sk["disableTTS"] || ![];
    if (sl) return;
    var sm = window["speechSynthesis"];
    if ((si != undefined && this["t2sLastID"] != si) || si == undefined) {
      sj = sj || 0x0;
      if (this["t2sLastID"] && sj > this["t2sLastPriority"]) {
        return;
      }
      if (sm["speaking"]) {
        sm["cancel"]();
      }
      this["t2sLastPriority"] = sj;
      this["t2sLastID"] = si;
      var sn = new SpeechSynthesisUtterance(sh);
      var so = sk["localeManager"]["currentLocaleID"];
      if (so) sn["lang"] = so;
      var sp = sk["textToSpeechConfig"];
      var sq;
      if (sp) {
        sn["volume"] = sp["volume"];
        sn["pitch"] = sp["pitch"];
        sn["rate"] = sp["rate"];
        if (sp["stopBackgroundAudio"]) this["pauseGlobalAudios"](null, !![]);
      }
      sn["onend"] = function () {
        this["t2sLastID"] = null;
        if (sq) clearInterval(sq);
        if (sp["stopBackgroundAudio"]) this["resumeGlobalAudios"]();
      }["bind"](this);
      if (
        navigator["userAgent"]["indexOf"]("Chrome") != -0x1 &&
        !this["get"]("isMobile")
      ) {
        sq = setInterval(function () {
          sm["pause"]();
          sm["resume"]();
        }, 0xbb8);
      }
      sm["speak"](sn);
    }
  } else {
    console["error"](
      "Text\x20to\x20Speech\x20isn\x27t\x20supported\x20on\x20this\x20browser"
    );
  }
};
TDV["Tour"]["Script"]["textToSpeechComponent"] = function (sr) {
  var ss = sr["get"]("class");
  var st;
  if (ss == "HTMLText") {
    var su = sr["get"]("html");
    if (su) {
      st = this["htmlToPlainText"](su, {
        linkProcess: function (sv, sw) {
          return sw;
        },
      });
    }
  } else if (ss == "BaseButton") {
    st = sr["get"]("label");
  } else if (ss == "Label") {
    st = sr["get"]("text");
  }
  if (st) {
    this["textToSpeech"](st, sr["get"]("id"));
  }
};
TDV["Tour"]["Script"]["_initTTSTooltips"] = function () {
  function sx(sz) {
    var sA = sz["source"];
    this["textToSpeech"](sA["get"]("toolTip"), sA["get"]("id"), 0x1);
  }
  function sy(sB) {
    var sC = sB["source"];
    this["stopTextToSpeech"](sC["get"]("id"));
  }
  setTimeout(
    function () {
      var sD = this["getByClassName"]("UIComponent");
      for (var sE = 0x0, sF = sD["length"]; sE < sF; ++sE) {
        var sG = sD[sE];
        var sH = sG["get"]("toolTip");
        if (!!sH || sG["get"]("class") == "ViewerArea") {
          sG["bind"]("toolTipShow", sx, this);
          sG["bind"]("toolTipHide", sy, this);
        }
      }
    }["bind"](this),
    0x0
  );
};
TDV["Tour"]["Script"]["takeScreenshot"] = function (sI) {
  var sJ = this["getActivePlayerWithViewer"](sI);
  if (sJ && sJ["get"]("class") == "PanoramaPlayer") sJ["saveScreenshot"]();
};
TDV["Tour"]["Script"]["htmlToPlainText"] = function htmlToPlainText(sK, sL) {
  var sM = function (t0, t1) {
    var t2 = "";
    for (var t3 = 0x0; t3 < t1; t3 += 0x1) {
      t2 += t0;
    }
    return t2;
  };
  var sN = null;
  var sO = null;
  var sP = "underline";
  var sQ = "indention";
  var sR = "-";
  var sS = 0x3;
  var sT = "-";
  var sU = ![];
  if (!!sL) {
    if (typeof sL["linkProcess"] === "function") {
      sN = sL["linkProcess"];
    }
    if (typeof sL["imgProcess"] === "function") {
      sO = sL["imgProcess"];
    }
    if (!!sL["headingStyle"]) {
      sP = sL["headingStyle"];
    }
    if (!!sL["listStyle"]) {
      sQ = sL["listStyle"];
    }
    if (!!sL["uIndentionChar"]) {
      sR = sL["uIndentionChar"];
    }
    if (!!sL["listIndentionTabs"]) {
      sS = sL["listIndentionTabs"];
    }
    if (!!sL["oIndentionChar"]) {
      sT = sL["oIndentionChar"];
    }
    if (!!sL["keepNbsps"]) {
      sU = sL["keepNbsps"];
    }
  }
  var sV = sM(sR, sS);
  var sW = String(sK)["replace"](/\n|\r/g, "\x20");
  const sX = sW["match"](/<\/body>/i);
  if (sX) {
    sW = sW["substring"](0x0, sX["index"]);
  }
  const sY = sW["match"](/<body[^>]*>/i);
  if (sY) {
    sW = sW["substring"](sY["index"] + sY[0x0]["length"], sW["length"]);
  }
  sW = sW["replace"](
    /<(script|style)( [^>]*)*>((?!<\/\1( [^>]*)*>).)*<\/\1>/gi,
    ""
  );
  sW = sW["replace"](
    /<(\/)?((?!h[1-6]( [^>]*)*>)(?!img( [^>]*)*>)(?!a( [^>]*)*>)(?!ul( [^>]*)*>)(?!ol( [^>]*)*>)(?!li( [^>]*)*>)(?!p( [^>]*)*>)(?!div( [^>]*)*>)(?!td( [^>]*)*>)(?!br( [^>]*)*>)[^>\/])[^<>]*>/gi,
    ""
  );
  sW = sW["replace"](/<img([^>]*)>/gi, function (t4, t5) {
    var t6 = "";
    var t7 = "";
    var t8 = /src="([^"]*)"/i["exec"](t5);
    var t9 = /alt="([^"]*)"/i["exec"](t5);
    if (t8 !== null) {
      t6 = t8[0x1];
    }
    if (t9 !== null) {
      t7 = t9[0x1];
    }
    if (typeof sO === "function") {
      return sO(t6, t7);
    }
    if (t7 === "") {
      return "![image]\x20(" + t6 + ")";
    }
    return "![" + t7 + "]\x20(" + t6 + ")";
  });
  function sZ() {
    return function (ta, tb, tc, td) {
      var te = 0x0;
      if (tc && /start="([0-9]+)"/i["test"](tc)) {
        te = /start="([0-9]+)"/i["exec"](tc)[0x1] - 0x1;
      }
      var tf =
        "<p>" +
        td["replace"](
          /<li[^>]*>(((?!<li[^>]*>)(?!<\/li>).)*)<\/li>/gi,
          function (tg, th) {
            var ti = 0x0;
            var tj = th["replace"](/(^|(<br \/>))(?!<p>)/gi, function () {
              if (tb === "o" && ti === 0x0) {
                te += 0x1;
                ti += 0x1;
                return "<br\x20/>" + te + sM(sT, sS - String(te)["length"]);
              }
              return "<br\x20/>" + sV;
            });
            return tj;
          }
        ) +
        "</p>";
      return tf;
    };
  }
  if (sQ === "linebreak") {
    sW = sW["replace"](/<\/?ul[^>]*>|<\/?ol[^>]*>|<\/?li[^>]*>/gi, "\x0a");
  } else if (sQ === "indention") {
    while (/<(o|u)l[^>]*>(.*)<\/\1l>/gi["test"](sW)) {
      sW = sW["replace"](
        /<(o|u)l([^>]*)>(((?!<(o|u)l[^>]*>)(?!<\/(o|u)l>).)*)<\/\1l>/gi,
        sZ()
      );
    }
  }
  if (sP === "linebreak") {
    sW = sW["replace"](/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, "\x0a$2\x0a");
  } else if (sP === "underline") {
    sW = sW["replace"](/<h1[^>]*>(((?!<\/h1>).)*)<\/h1>/gi, function (tk, tl) {
      return (
        "\x0a&nbsp;\x0a" +
        tl +
        "\x0a" +
        sM("=", tl["length"]) +
        "\x0a&nbsp;\x0a"
      );
    });
    sW = sW["replace"](/<h2[^>]*>(((?!<\/h2>).)*)<\/h2>/gi, function (tm, tn) {
      return (
        "\x0a&nbsp;\x0a" +
        tn +
        "\x0a" +
        sM("-", tn["length"]) +
        "\x0a&nbsp;\x0a"
      );
    });
    sW = sW["replace"](
      /<h([3-6])[^>]*>(((?!<\/h\1>).)*)<\/h\1>/gi,
      function (to, tp, tq) {
        return "\x0a&nbsp;\x0a" + tq + "\x0a&nbsp;\x0a";
      }
    );
  } else if (sP === "hashify") {
    sW = sW["replace"](
      /<h([1-6])[^>]*>([^<]*)<\/h\1>/gi,
      function (tr, ts, tt) {
        return "\x0a&nbsp;\x0a" + sM("#", ts) + "\x20" + tt + "\x0a&nbsp;\x0a";
      }
    );
  }
  sW = sW["replace"](
    /<br( [^>]*)*>|<p( [^>]*)*>|<\/p( [^>]*)*>|<div( [^>]*)*>|<\/div( [^>]*)*>|<td( [^>]*)*>|<\/td( [^>]*)*>/gi,
    "\x0a"
  );
  sW = sW["replace"](
    /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a[^>]*>/gi,
    function (tu, tv, tw) {
      if (typeof sN === "function") {
        return sN(tv, tw);
      }
      return "\x20[" + tw + "]\x20(" + tv + ")\x20";
    }
  );
  sW = sW["replace"](/\n[ \t\f]*/gi, "\x0a");
  sW = sW["replace"](/\n\n+/gi, "\x0a");
  if (sU) {
    sW = sW["replace"](/( |\t)+/gi, "\x20");
    sW = sW["replace"](/&nbsp;/gi, "\x20");
  } else {
    sW = sW["replace"](/( |&nbsp;|\t)+/gi, "\x20");
  }
  sW = sW["replace"](/\n +/gi, "\x0a");
  sW = sW["replace"](/^ +/gi, "");
  while (sW["indexOf"]("\x0a") === 0x0) {
    sW = sW["substring"](0x1);
  }
  if (
    sW["length"] === 0x0 ||
    sW["lastIndexOf"]("\x0a") !== sW["length"] - 0x1
  ) {
    sW += "\x0a";
  }
  return sW;
};
TDV["Tour"]["Script"]["openEmbeddedPDF"] = function (tx, ty) {
  var tz = !!window["MSInputMethodContext"] && !!document["documentMode"];
  if (tz) {
    this["openLink"](ty, "_blank");
    return;
  }
  var tA = tx["get"]("class");
  var tB = !new RegExp("^(?:[a-z]+:)?//", "i")["test"](ty);
  if (tB && tA == "WebFrame") {
    tx["set"](
      "url",
      "lib/pdfjs/web/viewer.html?file=" +
        encodeURIComponent(
          location["href"]["substring"](
            0x0,
            location["href"]["lastIndexOf"]("/")
          ) +
            "/" +
            ty
        )
    );
  } else {
    var tC = location["origin"] == new URL(ty)["origin"];
    var tD =
      "<iframe\x20\x20id=\x27googleViewer\x27\x20src=\x27https://docs.google.com/viewer?url=[url]&embedded=true\x27\x20width=\x27100%\x27\x20height=\x27100%\x27\x20frameborder=\x270\x27>" +
      "<p>This\x20browser\x20does\x20not\x20support\x20inline\x20PDFs.\x20Please\x20download\x20the\x20PDF\x20to\x20view\x20it:\x20<a\x20href=\x27[url]\x27>Download\x20PDF</a></p>" +
      "</iframe>";
    var tE = /^((?!chrome|android|crios|ipad|iphone).)*safari/i["test"](
      navigator["userAgent"]
    );
    var tF =
      "<div\x20id=\x22content\x22\x20style=\x22width:100%;height:100%;position:absolute;left:0;top:0;\x22></div>" +
      "<script\x20type=\x22text/javascript\x22>" +
      "!function(root,factory){\x22function\x22==typeof\x20define&&define.amd?define([],factory):\x22object\x22==typeof\x20module&&module.exports?module.exports=factory():root.PDFObject=factory()}(this,function(){\x22use\x20strict\x22;if(void\x200===window||void\x200===window.navigator||void\x200===window.navigator.userAgent||void\x200===window.navigator.mimeTypes)return!1;let\x20nav=window.navigator,ua=window.navigator.userAgent,isIE=\x22ActiveXObject\x22in\x20window,isModernBrowser=void\x200!==window.Promise,supportsPdfMimeType=void\x200!==nav.mimeTypes[\x22application/pdf\x22],isMobileDevice=void\x200!==nav.platform&&\x22MacIntel\x22===nav.platform&&void\x200!==nav.maxTouchPoints&&nav.maxTouchPoints>1||/Mobi|Tablet|Android|iPad|iPhone/.test(ua),isSafariDesktop=!isMobileDevice&&void\x200!==nav.vendor&&/Apple/.test(nav.vendor)&&/Safari/.test(ua),isFirefoxWithPDFJS=!(isMobileDevice||!/irefox/.test(ua))&&parseInt(ua.split(\x22rv:\x22)[1].split(\x22.\x22)[0],10)>18,createAXO=function(type){var\x20ax;try{ax=new\x20ActiveXObject(type)}catch(e){ax=null}return\x20ax},supportsPDFs=!isMobileDevice&&(isFirefoxWithPDFJS||supportsPdfMimeType||isIE&&!(!createAXO(\x22AcroPDF.PDF\x22)&&!createAXO(\x22PDF.PdfCtrl\x22))),embedError=function(msg,suppressConsole){return\x20suppressConsole||console.log(\x22[PDFObject]\x20\x22+msg),!1},emptyNodeContents=function(node){for(;node.firstChild;)node.removeChild(node.firstChild)},generatePDFJSMarkup=function(targetNode,url,pdfOpenFragment,PDFJS_URL,id,omitInlineStyles){emptyNodeContents(targetNode);let\x20fullURL=PDFJS_URL+\x22?file=\x22+encodeURIComponent(url)+pdfOpenFragment,div=document.createElement(\x22div\x22),iframe=document.createElement(\x22iframe\x22);return\x20iframe.src=fullURL,iframe.className=\x22pdfobject\x22,iframe.type=\x22application/pdf\x22,iframe.frameborder=\x220\x22,id&&(iframe.id=id),omitInlineStyles||(div.style.cssText=\x22position:\x20absolute;\x20top:\x200;\x20right:\x200;\x20bottom:\x200;\x20left:\x200;\x22,iframe.style.cssText=\x22border:\x20none;\x20width:\x20100%;\x20height:\x20100%;\x22,/*targetNode.style.position=\x22relative\x22,*/targetNode.style.overflow=\x22auto\x22),div.appendChild(iframe),targetNode.appendChild(div),targetNode.classList.add(\x22pdfobject-container\x22),targetNode.getElementsByTagName(\x22iframe\x22)[0]},embed=function(url,targetSelector,options){let\x20selector=targetSelector||!1,opt=options||{},id=\x22string\x22==typeof\x20opt.id?opt.id:\x22\x22,page=opt.page||!1,pdfOpenParams=opt.pdfOpenParams||{},fallbackLink=opt.fallbackLink||!0,width=opt.width||\x22100%\x22,height=opt.height||\x22100%\x22,assumptionMode=\x22boolean\x22!=typeof\x20opt.assumptionMode||opt.assumptionMode,forcePDFJS=\x22boolean\x22==typeof\x20opt.forcePDFJS&&opt.forcePDFJS,supportRedirect=\x22boolean\x22==typeof\x20opt.supportRedirect&&opt.supportRedirect,omitInlineStyles=\x22boolean\x22==typeof\x20opt.omitInlineStyles&&opt.omitInlineStyles,suppressConsole=\x22boolean\x22==typeof\x20opt.suppressConsole&&opt.suppressConsole,forceIframe=\x22boolean\x22==typeof\x20opt.forceIframe&&opt.forceIframe,PDFJS_URL=opt.PDFJS_URL||!1,targetNode=function(targetSelector){let\x20targetNode=document.body;return\x22string\x22==typeof\x20targetSelector?targetNode=document.querySelector(targetSelector):void\x200!==window.jQuery&&targetSelector\x20instanceof\x20jQuery&&targetSelector.length?targetNode=targetSelector.get(0):void\x200!==targetSelector.nodeType&&1===targetSelector.nodeType&&(targetNode=targetSelector),targetNode}(selector),fallbackHTML=\x22\x22,pdfOpenFragment=\x22\x22;if(\x22string\x22!=typeof\x20url)return\x20embedError(\x22URL\x20is\x20not\x20valid\x22,suppressConsole);if(!targetNode)return\x20embedError(\x22Target\x20element\x20cannot\x20be\x20determined\x22,suppressConsole);if(page&&(pdfOpenParams.page=page),pdfOpenFragment=function(pdfParams){let\x20prop,string=\x22\x22;if(pdfParams){for(prop\x20in\x20pdfParams)pdfParams.hasOwnProperty(prop)&&(string+=encodeURIComponent(prop)+\x22=\x22+encodeURIComponent(pdfParams[prop])+\x22&\x22);string&&(string=(string=\x22#\x22+string).slice(0,string.length-1))}return\x20string}(pdfOpenParams),forcePDFJS&&PDFJS_URL)return\x20generatePDFJSMarkup(targetNode,url,pdfOpenFragment,PDFJS_URL,id,omitInlineStyles);if(supportsPDFs||assumptionMode&&isModernBrowser&&!isMobileDevice){return\x20function(embedType,targetNode,targetSelector,url,pdfOpenFragment,width,height,id,omitInlineStyles){emptyNodeContents(targetNode);let\x20embed=document.createElement(embedType);if(embed.src=url+pdfOpenFragment,embed.className=\x22pdfobject\x22,embed.type=\x22application/pdf\x22,id&&(embed.id=id),!omitInlineStyles){let\x20style=\x22embed\x22===embedType?\x22overflow:\x20auto;\x22:\x22border:\x20none;\x22;targetSelector&&targetSelector!==document.body?style+=\x22width:\x20\x22+width+\x22;\x20height:\x20\x22+height+\x22;\x22:style+=\x22position:\x20absolute;\x20top:\x200;\x20right:\x200;\x20bottom:\x200;\x20left:\x200;\x20width:\x20100%;\x20height:\x20100%;\x22,embed.style.cssText=style}return\x20targetNode.classList.add(\x22pdfobject-container\x22),targetNode.appendChild(embed),targetNode.getElementsByTagName(embedType)[0]}(forceIframe||supportRedirect&&isSafariDesktop?\x22iframe\x22:\x22embed\x22,targetNode,targetSelector,url,pdfOpenFragment,width,height,id,omitInlineStyles)}return\x20PDFJS_URL?generatePDFJSMarkup(targetNode,url,pdfOpenFragment,PDFJS_URL,id,omitInlineStyles):(fallbackLink&&(fallbackHTML=\x22string\x22==typeof\x20fallbackLink?fallbackLink:\x22<p>This\x20browser\x20does\x20not\x20support\x20inline\x20PDFs.\x20Please\x20download\x20the\x20PDF\x20to\x20view\x20it:\x20<a\x20href=\x27[url]\x27>Download\x20PDF</a></p>\x22,targetNode.innerHTML=fallbackHTML.replace(/\x5c[url\x5c]/g,url)),embedError(\x22This\x20browser\x20does\x20not\x20support\x20embedded\x20PDFs\x22,suppressConsole))};return{embed:function(a,b,c){return\x20embed(a,b,c)},pdfobjectversion:\x222.2.3\x22,supportsPDFs:supportsPDFs}});" +
      "if\x20(typeof\x20module\x20===\x20\x22object\x22\x20&&\x20module.exports)\x20{" +
      "this.PDFObject\x20=\x20module.exports;" +
      "}" +
      "PDFObject.embed(\x22" +
      ty +
      "\x22,\x20\x22#content\x22,\x20{" +
      (tC
        ? "\x22PDFJS_URL\x22:\x20\x22" +
          new URL("lib/pdfjs/web/viewer.html", document["baseURI"])["href"] +
          "\x22,\x20"
        : "") +
      "\x22fallbackLink\x22:\x20\x22" +
      tD +
      "\x22," +
      "\x22forcePDFJS\x22:\x20" +
      tE +
      "});" +
      "if(!PDFObject.supportsPDFs\x20&&\x20!" +
      tC +
      "){" +
      "\x20var\x20iframeTimerId;" +
      "\x20function\x20startTimer(){" +
      "\x20\x20\x20\x20iframeTimerId\x20=\x20window.setTimeout(checkIframeLoaded,\x202000);" +
      "\x20}" +
      "\x20function\x20checkIframeLoaded(){\x20\x20" +
      "\x20\x20\x20\x20var\x20iframe\x20=\x20document.getElementById(\x22googleViewer\x22);" +
      "\x20\x20\x20\x20iframe.src\x20=\x20iframe.src;" +
      "\x20\x20\x20\x20iframeTimerId\x20=\x20window.setTimeout(checkIframeLoaded,\x202000);" +
      "\x20}" +
      "\x20document.getElementById(\x22googleViewer\x22).addEventListener(\x22load\x22,\x20function(){" +
      "\x20\x20\x20clearInterval(iframeTimerId);\x20" +
      "\x20});" +
      "\x20startTimer();" +
      "}" +
      "</script>";
    if (tA == "WebFrame") {
      tx["set"](
        "url",
        "data:text/html;charset=utf-8," +
          encodeURIComponent(
            "<!DOCTYPE\x20html>" +
              "<html>" +
              "<head></head>" +
              "<body\x20style=\x22height:100%;width:100%;overflow:hidden;margin:0px;background-color:rgb(82,\x2086,\x2089);\x22>" +
              tF +
              "</body>" +
              "</html>"
          )
      );
    } else if (tA == "HTML") {
      tx["set"](
        "content",
        "data:text/html;charset=utf-8," + encodeURIComponent(tF)
      );
    }
  }
};
TDV["Tour"]["Script"]["getKey"] = function (tG) {
  return window[tG];
};
TDV["Tour"]["Script"]["registerKey"] = function (tH, tI) {
  window[tH] = tI;
};
TDV["Tour"]["Script"]["unregisterKey"] = function (tJ) {
  delete window[tJ];
};
TDV["Tour"]["Script"]["existsKey"] = function (tK) {
  return tK in window;
};
//# sourceMappingURL=http://localhost:9000/script_v2021.2.3.js.map
//Generated with v2021.2.3, Fri Jan 24 2025
