"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, UserRole } from "@/types/admin";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (
    data: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
    },
    id?: number
  ) => void;
  editingUser: User | null;
}

const roles: UserRole[] = ["admin", "sales", "user"];

const AdminUserFormModal: React.FC<Props> = ({
  open,
  setOpen,
  onSubmit,
  editingUser,
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole,
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role,
      });
    } else {
      setForm({ name: "", email: "", password: "", role: "user" });
    }
    setErrors({});
  }, [editingUser, open]);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.name.trim()) errs.name = "Name required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Valid email required";
    if (!editingUser && (!form.password || form.password.length < 8))
      errs.password = "Password (min 8 chars) required";
    if (editingUser && form.password && form.password.length < 8)
      errs.password = "Password must be at least 8 chars";
    if (!form.role) errs.role = "Role required";
    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role as UserRole,
      ...(form.password ? { password: form.password } : {}),
    };
    if (editingUser) {
      onSubmit(data, editingUser.id);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={errors.name ? "border-red-500" : ""}
              autoFocus
            />
            {errors.name && (
              <div className="text-red-500 text-xs">{errors.name}</div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={errors.email ? "border-red-500" : ""}
              disabled={!!editingUser} // Email can't be changed on edit
            />
            {errors.email && (
              <div className="text-red-500 text-xs">{errors.email}</div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm">
              {editingUser ? "New Password" : "Password"}
            </label>
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={editingUser ? "Leave blank to keep unchanged" : ""}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <div className="text-red-500 text-xs">{errors.password}</div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm">Role</label>
            <Listbox
              value={form.role}
              onChange={(value) => setForm((f) => ({ ...f, role: value }))}
            >
              {({ open }) => (
                <div className="relative">
                  <Listbox.Button
                    className={`
            relative w-full py-2 pl-3 pr-10 text-left bg-white dark:bg-zinc-900
            border border-gray-300 dark:border-zinc-700 rounded text-sm
            shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            cursor-pointer
          `}
                  >
                    <span className="block truncate capitalize">
                      {form.role || "Select role"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options
                    className={`
            absolute mt-1 w-full z-10 bg-white dark:bg-zinc-900 shadow-lg max-h-60
            rounded ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none
          `}
                  >
                    {roles.map((role) => (
                      <Listbox.Option
                        key={role}
                        value={role}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none relative py-2 pl-10 pr-4 
                 ${
                   active
                     ? "bg-blue-100 dark:bg-zinc-800 text-blue-900 dark:text-white"
                     : ""
                 }
                 ${selected ? "font-bold" : ""}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate capitalize ${
                                selected ? "font-bold" : ""
                              }`}
                            >
                              {role}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              )}
            </Listbox>
            {errors.role && (
              <div className="text-red-500 text-xs">{errors.role}</div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white">
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserFormModal;
