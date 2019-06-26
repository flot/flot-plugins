# flot-plugins
Flot plugin library
## To run eslint
```
npm run eslint
```

## To build
```
npm run build
```

## To test
```
npm test
```

or to debug tests
```
npm run karma
```

## Version and Deployment
- This package is versioned according to [semantic versioning](http://semver.org).
- The version must be bumped using the `npm version` command (https://docs.npmjs.com/cli/version). This increments the version in package.json, creates a tag with the same version name, and commit both to the local repository.
- Push the commit and tag using `git push --follow-tags`. With a passing CI this will automatically trigger a deployment to NPM.

## Plugin documentation
 - [JUMFlot](docs/doc.flot.JUMFlot.md)
 - [Misc](docs/misc/misc.md)