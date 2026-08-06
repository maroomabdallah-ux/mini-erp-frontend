import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  CreditCard,
  Languages,
  LockKeyhole,
  Monitor,
  Moon,
  Palette,
  Save,
  Sun,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { usePreferences } from "@/shared/preferences/preferences-provider";
import { hasPermission, PERMISSIONS } from "@/shared/permissions/permissions";
import { settingsApi } from "./api";

export function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { t, theme, setTheme, language, setLanguage } = usePreferences();
  const [profile, setProfile] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  });
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  useEffect(
    () =>
      setProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      }),
    [user],
  );
  const profileMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: async () => {
      await refreshUser();
      toast.success(t("settings.profileSaved"));
    },
    onError: (error) => toast.error(error.message),
  });
  const passwordMutation = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: async () => {
      toast.success(t("settings.passwordChanged"));
      await logout();
    },
    onError: (error) => toast.error(error.message),
  });
  const savePassword = (event) => {
    event.preventDefault();
    if (password.new_password !== password.confirm_password)
      return toast.error(t("settings.passwordMismatch"));
    passwordMutation.mutate({
      current_password: password.current_password,
      new_password: password.new_password,
    });
  };
  const role =
    user.roles?.find((item) => item.is_active)?.name?.replaceAll("_", " ") ||
    "User";
  const canManageFinance = hasPermission(user, PERMISSIONS.ACCOUNTS_MANAGE);
  const salesSettings = useQuery({
    queryKey: ["sales-settings"],
    queryFn: settingsApi.sales,
    enabled: canManageFinance,
  });
  const salesMutation = useMutation({
    mutationFn: settingsApi.updateSales,
    onSuccess: () => {
      toast.success("Sales policy updated");
      salesSettings.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="page-stack settings-page">
      <section className="settings-heading">
        <div className="settings-heading-icon">
          <Palette />
        </div>
        <div>
          <p className="eyebrow-text">{t("settings.preferences")}</p>
          <h1>{t("settings.title")}</h1>
          <p>{t("settings.subtitle")}</p>
        </div>
      </section>
      <section className="settings-grid">
        <div className="settings-column">
          <SettingsCard
            icon={<UserRound />}
            title={t("settings.profile")}
            hint={t("settings.profileHint")}
          >
            <form
              className="settings-form"
              onSubmit={(event) => {
                event.preventDefault();
                profileMutation.mutate(profile);
              }}
            >
              <div className="form-grid">
                <Field label={t("settings.firstName")}>
                  <Input
                    value={profile.first_name}
                    onChange={(event) =>
                      setProfile({ ...profile, first_name: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label={t("settings.lastName")}>
                  <Input
                    value={profile.last_name}
                    onChange={(event) =>
                      setProfile({ ...profile, last_name: event.target.value })
                    }
                    required
                  />
                </Field>
              </div>
              <Field label={t("settings.email")}>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile({ ...profile, email: event.target.value })
                  }
                  required
                />
              </Field>
              <div className="profile-readonly">
                <span>
                  {t("settings.username")}
                  <strong>{user.username}</strong>
                </span>
                <span>
                  {t("settings.role")}
                  <strong className="capitalize">{role}</strong>
                </span>
              </div>
              <Button disabled={profileMutation.isPending}>
                <Save />
                {profileMutation.isPending
                  ? t("common.saving")
                  : t("settings.saveProfile")}
              </Button>
            </form>
          </SettingsCard>
          <SettingsCard
            icon={<LockKeyhole />}
            title={t("settings.security")}
            hint={t("settings.securityHint")}
          >
            <form className="settings-form" onSubmit={savePassword}>
              <Field label={t("settings.currentPassword")}>
                <Input
                  type="password"
                  value={password.current_password}
                  onChange={(event) =>
                    setPassword({
                      ...password,
                      current_password: event.target.value,
                    })
                  }
                  required
                />
              </Field>
              <div className="form-grid">
                <Field label={t("settings.newPassword")}>
                  <Input
                    type="password"
                    minLength={8}
                    value={password.new_password}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        new_password: event.target.value,
                      })
                    }
                    required
                  />
                </Field>
                <Field label={t("settings.confirmPassword")}>
                  <Input
                    type="password"
                    minLength={8}
                    value={password.confirm_password}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        confirm_password: event.target.value,
                      })
                    }
                    required
                  />
                </Field>
              </div>
              <Button disabled={passwordMutation.isPending}>
                <LockKeyhole />
                {passwordMutation.isPending
                  ? t("common.saving")
                  : t("settings.changePassword")}
              </Button>
            </form>
          </SettingsCard>
        </div>
        <div className="settings-column">
          <SettingsCard
            icon={<Palette />}
            title={t("settings.appearance")}
            hint={t("settings.appearanceHint")}
          >
            <div className="choice-grid">
              {[
                { id: "light", icon: Sun },
                { id: "dark", icon: Moon },
                { id: "system", icon: Monitor },
              ].map((item) => (
                <button
                  key={item.id}
                  className={theme === item.id ? "selected" : ""}
                  onClick={() => setTheme(item.id)}
                >
                  <item.icon />
                  <span>{t(`settings.${item.id}`)}</span>
                  {theme === item.id && <Check />}
                </button>
              ))}
            </div>
          </SettingsCard>
          <SettingsCard
            icon={<Languages />}
            title={t("settings.language")}
            hint={t("settings.languageHint")}
          >
            <div className="language-options">
              <button
                className={language === "en" ? "selected" : ""}
                onClick={() => setLanguage("en")}
              >
                <span>EN</span>
                <div>
                  <strong>{t("settings.english")}</strong>
                  <small>Left to right</small>
                </div>
                {language === "en" && <Check />}
              </button>
              <button
                className={language === "ar" ? "selected" : ""}
                onClick={() => setLanguage("ar")}
              >
                <span>ع</span>
                <div>
                  <strong>{t("settings.arabic")}</strong>
                  <small>من اليمين إلى اليسار</small>
                </div>
                {language === "ar" && <Check />}
              </button>
            </div>
          </SettingsCard>
          {canManageFinance && (
            <SettingsCard
              icon={<CreditCard />}
              title="Credit policy"
              hint="Choose whether credit-limit excess blocks confirmation or records a warning."
            >
              <div className="choice-grid">
                {["block", "warn"].map((value) => (
                  <button
                    key={value}
                    className={
                      salesSettings.data?.credit_limit_behavior === value
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      salesMutation.mutate({ credit_limit_behavior: value })
                    }
                  >
                    <span>{value === "block" ? "Block" : "Warn"}</span>
                    {salesSettings.data?.credit_limit_behavior === value && (
                      <Check />
                    )}
                  </button>
                ))}
              </div>
            </SettingsCard>
          )}
        </div>
      </section>
    </div>
  );
}
function SettingsCard({ icon, title, hint, children }) {
  return (
    <article className="settings-card">
      <header>
        <span>{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
      </header>
      <div className="settings-card-body">{children}</div>
    </article>
  );
}
function Field({ label, children }) {
  return (
    <div className="form-field">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
