package com.enxrtcsample;

import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.reactnativenavigation.NavigationActivity;
import com.reactnativenavigation.react.ReactGateway;

public class MainActivity extends NavigationActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public ReactGateway getReactGateway() {
        return super.getReactGateway();
    }

}

