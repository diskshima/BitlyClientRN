package com.bitlyclient;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import cl.json.RNSharePackage;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {
    private static final String SHARED_URL_KEY = "sharedUrl";

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "BitlyClient";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new VectorIconsPackage(),
            new RNSharePackage()
        );
    }

    @Override
    protected Bundle getLaunchOptions() {
        final Bundle bundle = new Bundle();
        final String sharedUrl = getSharedText();

        if (sharedUrl != null) {
            bundle.putCharSequence(SHARED_URL_KEY, sharedUrl);
        }

        return bundle;
    }

    private String getSharedText() {
        final Intent intent = getIntent();
        final String action = intent.getAction();
        final String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                final String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                return sharedText;
            }
        }

        return null;
    }
}
