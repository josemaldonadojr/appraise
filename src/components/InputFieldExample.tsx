import { InputField } from "~/components/InputField"
import { useState } from "react"

export function InputFieldExample() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Input Field Example</h2>
      
      <div className="max-w-md space-y-4">
        <InputField
          label="First name"
          placeholder="John"
          value={firstName}
          onChange={setFirstName}
        />
        
        <InputField
          label="Last name"
          placeholder="Doe"
          value={lastName}
          onChange={setLastName}
        />
        
        <InputField
          label="Email"
          placeholder="john@example.com"
          value={email}
          onChange={setEmail}
        />
      </div>
    </div>
  )
}
