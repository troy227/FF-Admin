# FF Admin
Build a small feature-flag admin for a SaaS product.

An admin can create a flag with a unique key (for example `new-checkout`) and a short description. New flags start off. An admin can list flags and turn a flag on or off. Any client can call an evaluate API with a flag key and a user id and learn whether that flag is enabled.

The UI must show an admin table with a toggle. A second area is a fake product surface: when the flag is off, a button or tab must be disabled (not deleted), so the interviewer can see the flag controlling the UI.

## Requirements

1. Admin can create a Flag. Default toggle off. A FF will be tied to a specific component. The key will denote the component.
2. Admin can toggle ON the flag. The disabled tab must be enabled
3. Admin can toggle OFF the flag.  The enabled tab must be disabled.

## Entities
1. flags
- id pkey
- key: string - index
- userIds[] - number[]. If null that means all.

## APIs
1. Evaluate GET /ff - Get all FF values
2. Create POST /ff - Create new FF
Body - {
    key: string,
    userIds?: number[]
    enabled: boolean
}
3. Update Flag PATCH /ff - Update FF to be enabled/disabled
4. Get a specific flag /ff?key=:key

## FE 
1. Home page with a navbar with 5 different tabs. Tab 1 is home.
2. 5th tab is create FF.
3. A view to create FF which takes 2 inputs, key and userIds as comma separated.
4. On FF off tab should be disabled.
5. On FF on tab should be re enabled.