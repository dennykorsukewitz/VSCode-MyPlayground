# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2024-04-22

### Changed

- Updated icon.

## [0.0.2]

### Added

The GitHub API is limited to 60 requests per hour for non authorized requests. You can provide your GitHub username and an access token to push this limit to 5000 requests per hour. Please see the [official GitHub doc](https://docs.github.com/en/free-pro-team@latest/rest/rate-limit/rate-limit?apiVersion=2022-11-28) for further information.
You can generate the access token in your [GitHub settings](https://github.com/settings/tokens).

- Added gitHubFileFetcher.githubUsername setting.
- Added gitHubFileFetcher.githubToken setting.

## [0.0.1]

### Refactoring

- Changed source language to TypeScript.
- Added esbuild to get Browser Editor support.
- Refactored code.
