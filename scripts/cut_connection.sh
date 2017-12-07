vagrant ssh redis1 -c "sudo iptables -A INPUT -s 10.0.0.12 -j DROP"
vagrant ssh redis1 -c "sudo iptables -A OUTPUT -d 10.0.0.12 -j DROP"