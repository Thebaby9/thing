#!/usr/bin/env bash
# 构建原生版 APK(Capacitor 内置页面,全屏离线)
# 产物: ~/下载/待办事项-原生版.apk
set -e
cd "$(dirname "$0")/project"
npx vite build --base=/
npx cap sync android
cd android
export JAVA_HOME="$HOME/android-tools/jdk17"
export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_SDK_ROOT="$HOME/android-sdk"
./gradlew assembleRelease --no-daemon -q
cp app/build/outputs/apk/release/app-release.apk "$HOME/下载/待办事项-原生版.apk"
echo "✓ APK 已生成: ~/下载/待办事项-原生版.apk"
