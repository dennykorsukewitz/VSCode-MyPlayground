# Changelog

All notable changes to the "MyPlayground" extension will be documented in this file.

## [Unreleased]

## [0.0.2]

### GitHubFileFetcher Added

The GitHub API is limited to 60 requests per hour for non authorized requests. You can provide your GitHub username and an access token to push this limit to 5000 requests per hour. Please see the [official GitHub doc](https://docs.github.com/en/free-pro-team@latest/rest/rate-limit/rate-limit?apiVersion=2022-11-28) for further information.
You can generate the access token in your [GitHub settings](https://github.com/settings/tokens).

- Added gitHubFileFetcher.githubUsername setting.
- Added gitHubFileFetcher.githubToken setting.

## [0.0.1]

### GitHubFileFetcher Refactoring

- Changed source language to TypeScript.
- Added esbuild to get Browser Editor support.
- Refactored code.
