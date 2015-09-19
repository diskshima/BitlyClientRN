/*
 * LinkModule.java
 * Copyright (C) 2015 diskshima <diskshima@diskshima-MBP.local>
 *
 * Distributed under terms of the MIT license.
 */
package com.diskshima;

import java.util.Map;
import java.util.HashMap;

import android.content.Intent;
import android.net.Uri;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class LinkModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;

        public LinkModule(ReactApplicationContext reactContext) {
        super(reactContext);

        this.reactContext = reactContext;
        }

    @Override
    public String getName() {
        return "LinkAndroid";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        return constants;
    }

    @ReactMethod
    public void open(String link) {
        final Intent browserIntent = new Intent(Intent.ACTION_VIEW,
            Uri.parse(link));
        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(browserIntent);
    }
}
