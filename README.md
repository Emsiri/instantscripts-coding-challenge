## InstantScripts coding challenge
To install: clone the repo locally and trigger an install with `npm i`
From here create a file in root named `cypress.env.json`
Fill with the following environment variables
```
{
  "USERNAME": "",
  "PASSWORD": ""
}
```
To run: Either use `npm test` or `npx cypress open`

## Considerations
I've left comments with my thoughts and plans on how I was going to tackle this test
where applicable. 

Selectors were a little difficult so I relied on contains and withins as much as I could rather then large ugly css paths.

I spent a significant amount of time trying to get the `updateUserProfile` route to work.

I find using APIs a vastly neater way of cleaning up after E2E tests but I was stuck on a 403 
(apparently you need more than the bearer token)