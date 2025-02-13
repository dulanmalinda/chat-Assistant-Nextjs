"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  GlobeIcon,
  WalletIcon,
} from "./icons";

export function WalletSelector({
  chatId,
  className,
  selectedWalletName,
}: {
  chatId: string;
  selectedWalletName: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);

  const [availableWallets, setAvailableWallets] = useState<
    Array<{ name: string; icon: React.ReactNode }>
  >([
    {
      name: "No wallet",
      icon: <WalletIcon />,
    },
  ]);

  const [_wallet, _setWallet] = useState(selectedWalletName);

  const _selectedWallet = useMemo(
    () => availableWallets.find((wallet) => wallet.name === _wallet),
    [_wallet]
  );

  useEffect(() => {
    fetchWallets();

    const interval = setInterval(() => {
      fetchWallets();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/available-wallets");
      if (!response.ok) throw new Error("Failed to fetch wallets");
      const data = await response.json();

      if (
        data.wallets &&
        Array.isArray(data.wallets) &&
        data.wallets.length > 0
      ) {
        const uniqueWallets = Array.from(
          new Map(
            data.wallets.map((wallet: any) => [wallet.wallet_name, wallet])
          ).values()
        ).map((wallet: any) => ({
          name: wallet.wallet_name,
          icon: <WalletIcon />,
        }));
        setAvailableWallets(uniqueWallets);

        const activeWalletResponse = await fetch("/api/active-wallet");
        if (!activeWalletResponse.ok)
          throw new Error("Failed to fetch active wallet");
        const activeWalletData = await activeWalletResponse.json();

        _setWallet(activeWalletData.wallets.wallet_name);
      } else {
        setAvailableWallets([
          {
            name: "No wallet",
            icon: <WalletIcon />,
          },
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setActiveWallet = async (wallet_name: string) => {
    try {
      const response = await fetch("/api/active-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet_name }),
      });

      if (!response.ok) throw new Error("Failed to set active wallet");

      const data = await response.json();
      console.log("Active wallet set:", data);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          variant="outline"
          className="hidden md:flex md:px-2 md:h-[34px]"
        >
          {_selectedWallet?.icon}
          {_selectedWallet?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableWallets.map((wallet) => (
          <DropdownMenuItem
            key={wallet.name}
            onSelect={() => {
              _setWallet(wallet.name);
              setActiveWallet(wallet.name);
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={wallet.name === _wallet}
          >
            <div className="flex flex-col gap-1 items-start">{wallet.name}</div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
