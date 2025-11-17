# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e7]
        - heading "SwiftFill Pro" [level=1] [ref=e11]
      - heading "Welcome back" [level=3] [ref=e12]
      - paragraph [ref=e13]: Sign in to access your forms
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - text: Email
          - textbox "Email" [ref=e17]:
            - /placeholder: your.email@example.com
        - generic [ref=e18]:
          - text: Password
          - textbox "Password" [ref=e19]:
            - /placeholder: ••••••••
        - button "Sign in" [ref=e20] [cursor=pointer]
      - button "Don't have an account? Sign up" [ref=e22] [cursor=pointer]
```