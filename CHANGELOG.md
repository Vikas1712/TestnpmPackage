# [2.1.0](https://dev.azure.com/CC-B2B-Intermediary/Platform/_git/platform-test-automation/compare/v2.0.1...v2.1.0) (2024-06-08)


### Features

* Microsoft Team Notification Setting ([7015130](https://dev.azure.com/CC-B2B-Intermediary/Platform/_git/platform-test-automation/commit/701513092f728774d8a9535ebfb34cbd4e9eb828))

# ChangeLog

## version 0.0.1

### Added

- Added new utility functions in util.
- API method CreateTokenAdvisorPortal(username,password) to generate access Token.

## version 0.0.2

### Added

- Update CreateTokenAdvisorPortal() method to reterive token for TAP environment.
- ClientID and RedirectUri no need to pass or store in environment file.

## version 0.0.3

### Added

- Update CreateTokenAdvisorPortal(username, pass, clientID) method to reterive token for TAP environment.
- ClientID need to pass as parameter.
- Create JSon schema located under the 'api-schema/' root director and validate objects.
-

## version 0.1.1

### Added

- Enhanced the **getAccessToken** function to streamline the process of obtaining an access token. The function now sequentially performs user login, Forge token retrieval, authorization code retrieval, and finally, access token retrieval.
- This change improves the readability and maintainability of the code, making the process of obtaining an access token more understandable
