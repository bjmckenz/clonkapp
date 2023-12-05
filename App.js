/*

README

IF you are using an HTTP server (not HTTPS), you must
add this to Info.plist (for iOS builds):

	<key>NSAllowsArbitraryLoads</key>
	<true/>

For geolocation:

npm install react-native-background-geolocation
npm install react-native-background-fetch@^4.2.1

also incorporate changes in:
* android/app/build.gradle
* android/build.gradle
* ios/app/Info.plist

*/

import React, {useState, useEffect} from 'react';
import {
  Text,
  SafeAreaView,
  Button,
  TextInput,
  StyleSheet,
  Platform,
  Switch,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BackgroundGeolocation from 'react-native-background-geolocation';

// iOS and Android emulators use different
// hostnames to refer to the host machine.
const defaultHost =
  Platform.OS == 'ios' ? 'http://127.0.0.1:5000' : 'http://10.0.2.2:5000';

const URL = '/clonk';

const App = () => {
  const [enabled, setEnabled] = useState(false);
  const [location, setLocation] = useState('');
  const [clonkers, setClonkers] = useState([{username: ''}]);
  const [username, setUsername] = useState('');
  const [server, setServer] = useState(defaultHost);

  useEffect(() => {
    const onLocation = BackgroundGeolocation.onLocation(locx => {
      console.log('[onLocation]', locx);
      if ('error' in locx) {
        setLocation(null);
        return;
      }
      distilled = {
        latitude: locx.coords.latitude,
        longitude: locx.coords.longitude,
        altitude: locx.coords.ellipsoidal_altitude,
      };

      setLocation(distilled);
    });

    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
      disableElasticity: true,
      // Activity Recognition
      stopTimeout: 5,
      // Application config
      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
    }).then(state => {
      setEnabled(state.enabled);
      console.log(
        '- BackgroundGeolocation is configured and ready: ',
        state.enabled,
      );
    });

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onLocation.remove();
    };
  }, []);

  /// 3. start / stop BackgroundGeolocation
  useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  const clonk = () => {
    console.log('username ' + JSON.stringify({un: username + ''}));
    console.log('clonkers ' + JSON.stringify({cl: clonkers}));

    if (username == '') {
      setClonkers([{username: 'no username given'}]);
      return;
    }

    setClonkers([{username: 'fetching'}]);

    fetchOptions = {
      method: 'POST',
      credentials: 'same-origin',
      mode: 'same-origin',
      body: JSON.stringify({
        ...(location? location : {}),
        id: username,
        version: "1.0.0"
      }),
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      }
    }

    fetch(server + URL, fetchOptions)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            console.log(data);
            setClonkers(data.clonks_within_window);
          });
        } else {
          setClonkers([{username: 'error: ' + response.status}]);
        }
      })
      .catch(error => setClonkers([{username: 'error: ' + error}]));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.label}>Server:</Text>
        <TextInput
          style={styles.input}
          value={server}
          placeholder="server IP or URL"
          onChangeText={setServer}
        />
        <Text style={styles.label}>Enable location:</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
        <Text style={styles.label}>Your location:</Text>
        <Text style={styles.data}>
          {location ? JSON.stringify(location, null, 2) : '(No location)'}
        </Text>
        <Text style={styles.label}>Who are you?</Text>
        <TextInput
          style={styles.input}
          value={username}
          placeholder="your name"
          onChangeText={setUsername}
        />
        <Button title="Clonk!" onPress={clonk} />
        <Text style={styles.label}>You clonked:</Text>
        <Text style={styles.data}>
          {clonkers.length
            ? JSON.stringify(clonkers, null, 2)
            : '(No one)'}
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    marginHorizontal: 2,
    padding: 10,
  },
  label: {
    marginHorizontal: 5,
    marginVertical: 1,
    padding: 5,
  },
  data: {
    marginHorizontal: 5,
    marginVertical: 1,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#efe',
  },
});

export default App;
