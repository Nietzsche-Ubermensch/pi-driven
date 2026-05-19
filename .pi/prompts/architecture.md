---
description: Analyze architecture and suggest improvements
argument-hint: "[scope]"
---
Analyze the architecture of $ARGUMENTS (or the entire codebase). Evaluate:

## Structure
- Package/module boundaries and cohesion
- Dependency direction (do low-level modules depend on high-level?)
- Circular dependencies
- Interface segregation (are interfaces focused?)

## Patterns
- Consistency with existing codebase patterns
- Use of Result<T> pattern vs exceptions
- Use of branded types vs primitives
- Adherence to coding preferences (no `any`, proper error handling)

## Scalability
- Can this handle 10x data/requests?
- Are there obvious performance bottlenecks?
- Is the design testable at all levels (unit, integration, e2e)?

## Maintainability
- Would a new team member understand this in 30 minutes?
- Are complex decisions documented (ADRs)?
- Is the code self-documenting or does it need comments?

## Recommendations
For each finding, provide:
1. What's the issue?
2. Why does it matter?
3. What specific change would fix it?
4. What's the risk/effort of the change?
