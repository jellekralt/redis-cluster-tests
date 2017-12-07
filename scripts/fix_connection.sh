vagrant ssh redis1 -c "sudo iptables -D INPUT -s 10.0.0.12 -j DROP"
vagrant ssh redis1 -c "sudo iptables -D OUTPUT -d 10.0.0.12 -j DROP"